import crypto from "crypto";
import type { Project, Prompt, ApiKey, UsageRecord } from "wasp/entities";
import { HttpError } from "wasp/server";
import type {
  GetProjects,
  GetProjectById,
  GetApiKeys,
  GetProjectUsage,
  CreateProject,
  UpdateProject,
  DeleteProject,
  CreatePrompt,
  UpdatePrompt,
  DeletePrompt,
  GenerateApiKey,
  RevokeApiKey,
  GenerateSkillsFromDocs,
  GetTempPdfUploadUrl,
  GenerateSkillsFromPdf,
} from "wasp/server/operations";
import * as z from "zod";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";
import Firecrawl from "@mendable/firecrawl-js";
import OpenAI from "openai";
import { Mistral } from "@mistralai/mistralai";
import {
  getUploadFileSignedURLFromS3,
  getDownloadFileSignedURLFromS3,
  deleteFileFromS3,
} from "../file-upload/s3Utils";

// ─── Embedding helper ────────────────────────────────────────────────────────

async function embedSkillText(name: string, description?: string, content?: string): Promise<number[] | null> {
  try {
    const text = [name, description || "", content || ""].filter(Boolean).join("\n");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (e) {
    console.error("[embedSkillText] failed:", e);
    return null;
  }
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const getProjects: GetProjects<void, Project[]> = async (
  _args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.Project.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });
};

const getProjectByIdSchema = z.object({
  id: z.string(),
});

type GetProjectByIdInput = z.infer<typeof getProjectByIdSchema>;

type ProjectWithRelations = Project & {
  prompts: Prompt[];
};

export const getProjectById: GetProjectById<
  GetProjectByIdInput,
  ProjectWithRelations
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(getProjectByIdSchema, rawArgs);

  const project = await context.entities.Project.findUnique({
    where: { id, userId: context.user.id },
    include: { prompts: true },
  });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  return project;
};

export const getApiKeys: GetApiKeys<void, ApiKey[]> = async (
  _args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  return context.entities.ApiKey.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });
};

// ─── Usage Query ────────────────────────────────────────────────────────────

const getProjectUsageSchema = z.object({
  projectId: z.string().optional(),
});

type GetProjectUsageInput = z.infer<typeof getProjectUsageSchema>;

type DailyProjectUsage = {
  date: string;
  projectId: string;
  projectName: string;
  requests: number;
  cost: number;
};

export const getProjectUsage: GetProjectUsage<
  GetProjectUsageInput,
  DailyProjectUsage[]
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { projectId } = ensureArgsSchemaOrThrowHttpError(
    getProjectUsageSchema,
    rawArgs,
  );

  // If filtering by project, verify ownership
  if (projectId) {
    const project = await context.entities.Project.findUnique({
      where: { id: projectId, userId: context.user.id },
    });
    if (!project) {
      throw new HttpError(404, "Project not found");
    }
  }

  const records = await context.entities.UsageRecord.findMany({
    where: {
      project: { userId: context.user.id },
      ...(projectId ? { projectId } : {}),
    },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate by day + project
  const byKey = new Map<string, DailyProjectUsage>();
  for (const r of records) {
    const date = r.createdAt.toISOString().slice(0, 10);
    const key = `${date}:${r.projectId}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.requests += 1;
      existing.cost += r.cost;
    } else {
      byKey.set(key, {
        date,
        projectId: r.projectId,
        projectName: r.project.name,
        requests: 1,
        cost: r.cost,
      });
    }
  }

  return Array.from(byKey.values());
};

// ─── Project Actions ────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createProject: CreateProject<CreateProjectInput, Project> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { name, description } = ensureArgsSchemaOrThrowHttpError(
    createProjectSchema,
    rawArgs,
  );

  return context.entities.Project.create({
    data: {
      name,
      description,
      user: { connect: { id: context.user.id } },
    },
  });
};

const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const updateProject: UpdateProject<UpdateProjectInput, Project> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id, ...data } = ensureArgsSchemaOrThrowHttpError(
    updateProjectSchema,
    rawArgs,
  );

  return context.entities.Project.update({
    where: { id, userId: context.user.id },
    data,
  });
};

const deleteProjectSchema = z.object({
  id: z.string(),
});

type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

export const deleteProject: DeleteProject<DeleteProjectInput, Project> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(deleteProjectSchema, rawArgs);

  return context.entities.Project.delete({
    where: { id, userId: context.user.id },
  });
};

// ─── Prompt Actions ─────────────────────────────────────────────────────────

const createPromptSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  content: z.string(),
  type: z.enum(["base", "skill"]),
});

type CreatePromptInput = z.infer<typeof createPromptSchema>;

export const createPrompt: CreatePrompt<CreatePromptInput, Prompt> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { projectId, name, description, content, type } =
    ensureArgsSchemaOrThrowHttpError(createPromptSchema, rawArgs);

  // If type is "base", ensure there isn't already a base prompt
  if (type === "base") {
    const existing = await context.entities.Prompt.findFirst({
      where: { projectId, type: "base" },
    });
    if (existing) {
      throw new HttpError(400, "Project already has a base prompt. Update it instead.");
    }
  }

  const embedding = type === "skill" ? await embedSkillText(name, description, content) : null;
  return context.entities.Prompt.create({
    data: {
      name,
      description,
      content,
      type,
      source: "user",
      ...(embedding && { embedding }),
      project: { connect: { id: projectId } },
    },
  });
};

const updatePromptSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
});

type UpdatePromptInput = z.infer<typeof updatePromptSchema>;

export const updatePrompt: UpdatePrompt<UpdatePromptInput, Prompt> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id, ...data } = ensureArgsSchemaOrThrowHttpError(
    updatePromptSchema,
    rawArgs,
  );

  const prompt = await context.entities.Prompt.findFirst({
    where: { id, project: { userId: context.user.id } },
  });

  if (!prompt) {
    throw new HttpError(404, "Prompt not found");
  }

  // Re-embed if any text field changed on a skill
  let embedding: number[] | null = null;
  if (prompt.type === "skill" && (data.name || data.description || data.content)) {
    embedding = await embedSkillText(
      data.name || prompt.name,
      data.description ?? prompt.description ?? undefined,
      data.content || prompt.content,
    );
  }

  return context.entities.Prompt.update({
    where: { id },
    data: { ...data, ...(embedding && { embedding }), updatedAt: new Date(), updatedBy: "user" },
  });
};

const deletePromptSchema = z.object({
  id: z.string(),
});

type DeletePromptInput = z.infer<typeof deletePromptSchema>;

export const deletePrompt: DeletePrompt<DeletePromptInput, Prompt> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(deletePromptSchema, rawArgs);

  const prompt = await context.entities.Prompt.findFirst({
    where: { id, project: { userId: context.user.id } },
  });

  if (!prompt) {
    throw new HttpError(404, "Prompt not found");
  }

  return context.entities.Prompt.delete({ where: { id } });
};

// ─── Generate Skills from Docs ──────────────────────────────────────────────

const generateSkillsFromDocsSchema = z.object({
  projectId: z.string(),
  url: z.string().url(),
});

type GenerateSkillsFromDocsInput = z.infer<typeof generateSkillsFromDocsSchema>;

export const generateSkillsFromDocs: GenerateSkillsFromDocs<
  GenerateSkillsFromDocsInput,
  Prompt[]
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { projectId, url } = ensureArgsSchemaOrThrowHttpError(
    generateSkillsFromDocsSchema,
    rawArgs,
  );

  // Verify project ownership
  const project = await context.entities.Project.findUnique({
    where: { id: projectId, userId: context.user.id },
  });
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  // Crawl the docs site with Firecrawl
  const firecrawl = new Firecrawl({
    apiKey: process.env.FIRECRAWL_API_KEY!,
  });

  const crawlResult = await firecrawl.crawl(url, {
    limit: 20,
    scrapeOptions: { formats: ["markdown"] },
  });

  if (crawlResult.status !== "completed") {
    throw new HttpError(502, "Failed to crawl the documentation site");
  }

  // Collect markdown content from crawled pages
  const pages = (crawlResult.data ?? [])
    .filter((page: any) => page.markdown)
    .map((page: any) => page.markdown as string);

  if (!pages.length) {
    throw new HttpError(422, "No readable content found at the provided URL");
  }

  // Truncate to ~100k chars to stay within token limits
  const MAX_CHARS = 100_000;
  let aggregated = "";
  for (const page of pages) {
    if (aggregated.length + page.length > MAX_CHARS) {
      aggregated += page.slice(0, MAX_CHARS - aggregated.length);
      break;
    }
    aggregated += page + "\n\n---\n\n";
  }

  // Ask OpenAI to generate skills from the docs content
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert at analyzing documentation and extracting distinct skills for an AI agent.

Given documentation content, identify the key knowledge areas and create a set of skills. Each skill should represent a distinct topic or capability the agent needs.

Return a JSON object with a "skills" array. Each skill has:
- "name": short descriptive name (e.g. "Returns Policy", "API Authentication")
- "description": one sentence explaining when the agent should use this skill
- "content": the actual instructions and knowledge for this skill, written as clear directives the agent can follow. Include relevant details, steps, and rules from the docs.

Aim for 3-10 skills depending on the breadth of the documentation. Each skill should be self-contained and focused on one topic.`,
      },
      {
        role: "user",
        content: `Analyze the following documentation and generate skills:\n\n${aggregated}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new HttpError(502, "Failed to generate skills from the documentation");
  }

  let parsed: { skills: { name: string; description: string; content: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError(502, "AI returned invalid JSON");
  }

  if (!Array.isArray(parsed.skills) || !parsed.skills.length) {
    throw new HttpError(422, "AI could not identify any skills from the documentation");
  }

  // Bulk-create all skills
  const created: Prompt[] = [];
  for (const skill of parsed.skills) {
    const embedding = await embedSkillText(skill.name, skill.description, skill.content);
    const prompt = await context.entities.Prompt.create({
      data: {
        name: skill.name,
        description: skill.description,
        content: skill.content,
        type: "skill",
        source: "user",
        ...(embedding && { embedding }),
        project: { connect: { id: projectId } },
      },
    });
    created.push(prompt);
  }

  return created;
};

// ─── API Key Actions ────────────────────────────────────────────────────────

const generateApiKeySchema = z.object({
  name: z.string().min(1),
});

type GenerateApiKeyInput = z.infer<typeof generateApiKeySchema>;

export const generateApiKey: GenerateApiKey<
  GenerateApiKeyInput,
  ApiKey
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { name } = ensureArgsSchemaOrThrowHttpError(
    generateApiKeySchema,
    rawArgs,
  );

  const key = `orama_${crypto.randomBytes(32).toString("hex")}`;

  return context.entities.ApiKey.create({
    data: {
      key,
      name,
      user: { connect: { id: context.user.id } },
    },
  });
};

const revokeApiKeySchema = z.object({
  id: z.string(),
});

type RevokeApiKeyInput = z.infer<typeof revokeApiKeySchema>;

export const revokeApiKey: RevokeApiKey<RevokeApiKeyInput, ApiKey> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(revokeApiKeySchema, rawArgs);

  return context.entities.ApiKey.delete({
    where: { id, userId: context.user.id },
  });
};

// ─── PDF Skill Generation ───────────────────────────────────────────────────

const getTempPdfUploadUrlSchema = z.object({
  fileName: z.string().nonempty(),
});

type GetTempPdfUploadUrlInput = z.infer<typeof getTempPdfUploadUrlSchema>;
type GetTempPdfUploadUrlOutput = {
  s3UploadUrl: string;
  s3UploadFields: Record<string, string>;
  s3Key: string;
};

export const getTempPdfUploadUrl: GetTempPdfUploadUrl<
  GetTempPdfUploadUrlInput,
  GetTempPdfUploadUrlOutput
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { fileName } = ensureArgsSchemaOrThrowHttpError(
    getTempPdfUploadUrlSchema,
    rawArgs,
  );

  return getUploadFileSignedURLFromS3({
    fileName,
    fileType: "application/pdf",
    userId: context.user.id,
  });
};

const generateSkillsFromPdfSchema = z.object({
  projectId: z.string(),
  s3Keys: z.array(z.string()).min(1),
});

type GenerateSkillsFromPdfInput = z.infer<typeof generateSkillsFromPdfSchema>;

export const generateSkillsFromPdf: GenerateSkillsFromPdf<
  GenerateSkillsFromPdfInput,
  Prompt[]
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { projectId, s3Keys } = ensureArgsSchemaOrThrowHttpError(
    generateSkillsFromPdfSchema,
    rawArgs,
  );

  // Verify project ownership
  const project = await context.entities.Project.findUnique({
    where: { id: projectId, userId: context.user.id },
  });
  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  // Load existing skills for this project so we can enhance instead of duplicate
  const existingSkills = await context.entities.Prompt.findMany({
    where: { projectId, type: "skill" },
    select: { id: true, name: true, description: true, content: true },
  });

  // Extract text from all PDFs with Mistral OCR
  const mistralApiKey = process.env.MISTRAL_API_KEY;
  if (!mistralApiKey) {
    throw new HttpError(500, "Missing MISTRAL_API_KEY");
  }

  const mistral = new Mistral({ apiKey: mistralApiKey });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const MAX_CHARS = 100_000;

  const generateSkillsForText = async (text: string) => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing documents and extracting distinct skills for an AI agent.

Given document content, identify the key knowledge areas and create a set of skills. Each skill should represent a distinct topic or capability the agent needs.

Return a JSON object with a "skills" array. Each skill has:
- "name": short descriptive name (e.g. "Returns Policy", "API Authentication")
- "description": one sentence explaining when the agent should use this skill
- "content": the actual instructions and knowledge for this skill, written as clear directives the agent can follow. Include relevant details, steps, and rules from the document.

Aim for 3-10 skills depending on the breadth of the content. Each skill should be self-contained and focused on one topic.`,
        },
        {
          role: "user",
          content: `Analyze the following document and generate skills:\n\n${text}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return [];
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p.skills) ? p.skills : [];
    } catch {
      return [];
    }
  };

  // Process each PDF independently in parallel: OCR + skill generation per file
  const allSkills: { name: string; description: string; content: string }[] = [];

  try {
    const results = await Promise.allSettled(
      s3Keys.map(async (s3Key) => {
        const signedUrl = await getDownloadFileSignedURLFromS3({ s3Key });
        const ocr = await mistral.ocr.process({
          model: "mistral-ocr-latest",
          document: { type: "document_url", documentUrl: signedUrl },
          includeImageBase64: false,
        });
        const pages = ocr.pages ?? [];
        if (pages.length === 0) return [];
        let text = pages.map((p: { markdown: string }) => p.markdown).join("\n\n");
        if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);
        return generateSkillsForText(text);
      }),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allSkills.push(...result.value);
      }
    }
  } finally {
    for (const s3Key of s3Keys) {
      try { await deleteFileFromS3({ s3Key }); } catch {}
    }
  }

  if (allSkills.length === 0) {
    throw new HttpError(422, "No skills could be extracted from the uploaded PDFs");
  }

  // Semantically deduplicate and merge skills across all files
  let deduplicatedSkills = allSkills;
  if (allSkills.length > 1) {
    const skillsJson = JSON.stringify(allSkills, null, 2);
    const dedupeCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert at organizing knowledge for an AI agent.

You will receive a list of skills extracted from multiple documents. Your job is to identify and merge only near-duplicate skills — ones that are essentially the same process or policy under a slightly different name.

Merging rules (strict):
- Only merge skills that are near-identical in scope (e.g. "Returns Policy" and "Return Process" cover the exact same thing).
- Do NOT merge skills that are merely related or belong to the same domain (e.g. "Payment Methods" and "Checkout Process" must stay separate).
- When in doubt, keep skills separate.

When merging:
- Workflow steps are the most important part — preserve every step from every version, in full detail. Never summarize, shorten, or drop a step.
- Combine any additional rules, conditions, or notes from all merged versions.
- Choose the most descriptive name.

Return a JSON object with a "skills" array. Each skill has:
- "name": short descriptive name
- "description": one sentence explaining when the agent should use this skill
- "content": the full instructions including all workflow steps, written as clear directives`,
        },
        {
          role: "user",
          content: `Deduplicate and merge the following skills:\n\n${skillsJson}`,
        },
      ],
    });

    const dedupeRaw = dedupeCompletion.choices[0]?.message?.content;
    if (dedupeRaw) {
      try {
        const p = JSON.parse(dedupeRaw);
        if (Array.isArray(p.skills) && p.skills.length > 0) {
          deduplicatedSkills = p.skills;
        }
      } catch {}
    }
  }

  // Build a lookup map of existing skills by lowercase name for matching
  const existingByName = new Map(
    existingSkills.map((s) => [s.name.toLowerCase(), s]),
  );

  const upserted: Prompt[] = [];
  for (const skill of deduplicatedSkills) {
    const existing = existingByName.get(skill.name.toLowerCase());
    const embedding = await embedSkillText(skill.name, skill.description, skill.content);
    if (existing) {
      // Enhance existing skill
      const updated = await context.entities.Prompt.update({
        where: { id: existing.id },
        data: {
          description: skill.description,
          content: skill.content,
          updatedBy: "user",
          ...(embedding && { embedding }),
        },
      });
      upserted.push(updated);
    } else {
      // Create new skill
      const created = await context.entities.Prompt.create({
        data: {
          name: skill.name,
          description: skill.description,
          content: skill.content,
          type: "skill",
          source: "user",
          ...(embedding && { embedding }),
          project: { connect: { id: projectId } },
        },
      });
      upserted.push(created);
    }
  }

  return upserted;
};
