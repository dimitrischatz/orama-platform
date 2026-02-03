import crypto from "crypto";
import type { Project, Prompt, DocSource, ApiKey, UsageRecord } from "wasp/entities";
import { HttpError } from "wasp/server";
import type {
  GetProjects,
  GetProjectById,
  GetApiKeys,
  GetProjectUsage,
  CreateProject,
  UpdateProject,
  DeleteProject,
  AddDocSource,
  RemoveDocSource,
  CreatePrompt,
  UpdatePrompt,
  DeletePrompt,
  GenerateApiKey,
  RevokeApiKey,
  GenerateSkillsFromDocs,
} from "wasp/server/operations";
import * as z from "zod";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";
import Firecrawl from "@mendable/firecrawl-js";
import OpenAI from "openai";

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
  docSources: DocSource[];
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
    include: { prompts: true, docSources: true },
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
  promptTokens: number;
  completionTokens: number;
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
      existing.promptTokens += r.promptTokens;
      existing.completionTokens += r.completionTokens;
    } else {
      byKey.set(key, {
        date,
        projectId: r.projectId,
        projectName: r.project.name,
        requests: 1,
        promptTokens: r.promptTokens,
        completionTokens: r.completionTokens,
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

// ─── DocSource Actions ──────────────────────────────────────────────────────

const addDocSourceSchema = z.object({
  projectId: z.string(),
  url: z.string().url(),
  label: z.string().optional(),
  type: z.string().default("docs"),
});

type AddDocSourceInput = z.infer<typeof addDocSourceSchema>;

export const addDocSource: AddDocSource<AddDocSourceInput, DocSource> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { projectId, url, label, type } = ensureArgsSchemaOrThrowHttpError(
    addDocSourceSchema,
    rawArgs,
  );

  return context.entities.DocSource.create({
    data: {
      url,
      label,
      type,
      project: { connect: { id: projectId } },
    },
  });
};

const removeDocSourceSchema = z.object({
  id: z.string(),
});

type RemoveDocSourceInput = z.infer<typeof removeDocSourceSchema>;

export const removeDocSource: RemoveDocSource<
  RemoveDocSourceInput,
  DocSource
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(
    removeDocSourceSchema,
    rawArgs,
  );

  // Ensure the doc source belongs to a project owned by this user
  const docSource = await context.entities.DocSource.findFirst({
    where: { id, project: { userId: context.user.id } },
  });

  if (!docSource) {
    throw new HttpError(404, "Doc source not found");
  }

  return context.entities.DocSource.delete({ where: { id } });
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

  return context.entities.Prompt.create({
    data: {
      name,
      description,
      content,
      type,
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

  return context.entities.Prompt.update({ where: { id }, data });
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
    const prompt = await context.entities.Prompt.create({
      data: {
        name: skill.name,
        description: skill.description,
        content: skill.content,
        type: "skill",
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
