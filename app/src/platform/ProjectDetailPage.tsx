import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getProjectById,
  updateProject,
  deleteProject,
  createPrompt,
  updatePrompt,
  deletePrompt,
  generateSkillsFromDocs,
  getTempPdfUploadUrl,
  generateSkillsFromPdf,
  useQuery,
} from "wasp/client/operations";
import type { User, Prompt } from "wasp/entities";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Pencil,
  FileText,
  Sparkles,
  Loader2,
  Wand2,
  Code2,
  Copy,
  Check,
  FileUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../client/components/ui/dialog";
import { useToast } from "../client/hooks/use-toast";
import { Highlight, themes } from "prism-react-renderer";

// ─── Shared styles ──────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-white/[0.07] bg-[#18181c] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

const btnPrimary =
  "rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50";

const btnOutline =
  "inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05]";

const btnGhost =
  "rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200";

const sectionCard =
  "rounded-2xl border border-white/[0.07] bg-[#111114]";

const labelClass =
  "mb-1.5 block text-sm font-medium text-zinc-200";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProjectDetailPage(_props: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(getProjectById, { id: id! });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 lg:p-10">
        <p className="text-sm text-red-500">Project not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-zinc-500 hover:text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const basePrompt = project.prompts.find((p) => p.type === "base");
  const skills = project.prompts.filter((p) => p.type === "skill");

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject({ id: project.id });
      toast({ title: "Project deleted" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="flex flex-col gap-8">
        <ProjectSettingsSection project={project} />
        <BasePromptSection projectId={project.id} basePrompt={basePrompt} />
        <SkillsSection projectId={project.id} skills={skills} />
        <IntegrationSection projectId={project.id} />
      </div>
    </div>
  );
}

// ─── Project Settings ───────────────────────────────────────────────────────

function ProjectSettingsSection({
  project,
}: {
  project: { id: string; name: string; description: string | null };
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProject({
        id: project.id,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: "Project updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={sectionCard + " p-6"}>
      <h2 className="mb-1 text-base font-semibold text-white">
        Settings
      </h2>
      <p className="mb-6 text-sm text-zinc-500">Project name and description</p>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="project-name" className={labelClass}>
            Name
          </label>
          <input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="project-desc" className={labelClass}>
            Description
          </label>
          <textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className={btnPrimary}
          >
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Base Prompt ────────────────────────────────────────────────────────────

function BasePromptSection({
  projectId,
  basePrompt,
}: {
  projectId: string;
  basePrompt?: Prompt;
}) {
  const [content, setContent] = useState(basePrompt?.content ?? "");
  const [name, setName] = useState(basePrompt?.name ?? "Base Prompt");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      if (basePrompt) {
        await updatePrompt({ id: basePrompt.id, name, content });
      } else {
        await createPrompt({ projectId, name, content, type: "base" });
      }
      toast({ title: "Base prompt saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-1 flex items-center gap-2">
        <FileText className="h-5 w-5 text-orange-500" />
        <h2 className="text-base font-semibold text-white">
          Base Prompt
        </h2>
      </div>
      <p className="mb-6 text-sm text-zinc-500">
        The system prompt that defines your agent's core personality and behavior.
      </p>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="base-name" className={labelClass}>
            Name
          </label>
          <input
            id="base-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="base-content" className={labelClass}>
            Content
          </label>
          <textarea
            id="base-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="You are a helpful assistant that..."
            className={inputClass + " font-mono text-xs"}
          />
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className={btnPrimary}>
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skills ─────────────────────────────────────────────────────────────────

function SkillsSection({
  projectId,
  skills,
}: {
  projectId: string;
  skills: Prompt[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Prompt | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="text-base font-semibold text-white">
            Skills
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Dialog
            open={generateDialogOpen}
            onOpenChange={setGenerateDialogOpen}
          >
            <DialogTrigger asChild>
              <button className={btnOutline}>
                <Wand2 className="h-4 w-4" />
                Auto-generate
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Auto-generate Skills from Docs</DialogTitle>
              </DialogHeader>
              <GenerateSkillsForm
                projectId={projectId}
                onDone={() => setGenerateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
            <DialogTrigger asChild>
              <button className={btnOutline}>
                <FileUp className="h-4 w-4" />
                Upload PDF
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Skills from PDF</DialogTitle>
              </DialogHeader>
              <PdfUploadForm
                projectId={projectId}
                onDone={() => setPdfDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingSkill(null);
            }}
          >
            <DialogTrigger asChild>
              <button className={btnOutline}>
                <Plus className="h-4 w-4" />
                Add Skill
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSkill ? "Edit Skill" : "New Skill"}
                </DialogTitle>
              </DialogHeader>
              <SkillForm
                projectId={projectId}
                skill={editingSkill}
                onDone={() => {
                  setDialogOpen(false);
                  setEditingSkill(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <p className="mb-6 text-sm text-zinc-500">
        Modular knowledge chunks the agent can pull in contextually.
      </p>

      {!skills.length ? (
        <p className="py-6 text-center text-sm text-zinc-400">No skills yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onEdit={() => {
                setEditingSkill(skill);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkillCard({
  skill,
  onEdit,
}: {
  skill: Prompt;
  onEdit: () => void;
}) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deletePrompt({ id: skill.id });
      toast({ title: "Skill deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-start justify-between rounded-xl border border-white/[0.07] bg-[#18181c] p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">
            {skill.name}
          </p>
          {skill.source === "agent" && (
            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              agent
            </span>
          )}
        </div>
        {skill.description && (
          <p className="mt-1 text-xs text-zinc-500">{skill.description}</p>
        )}
        <p className="mt-2 line-clamp-2 font-mono text-xs text-zinc-400">
          {skill.content}
        </p>
      </div>
      <div className="ml-4 flex items-center gap-1">
        <button onClick={onEdit} className={btnGhost}>
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SkillForm({
  projectId,
  skill,
  onDone,
}: {
  projectId: string;
  skill: Prompt | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(skill?.name ?? "");
  const [description, setDescription] = useState(skill?.description ?? "");
  const [content, setContent] = useState(skill?.content ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (skill) {
        await updatePrompt({
          id: skill.id,
          name,
          description: description || undefined,
          content,
        });
        toast({ title: "Skill updated" });
      } else {
        await createPrompt({
          projectId,
          name,
          description: description || undefined,
          content,
          type: "skill",
        });
        toast({ title: "Skill created" });
      }
      onDone();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
      <div>
        <label htmlFor="skill-name" className={labelClass}>
          Name
        </label>
        <input
          id="skill-name"
          placeholder="e.g. Returns Policy"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="skill-desc" className={labelClass}>
          Description{" "}
          <span className="font-normal text-zinc-400">
            (helps the agent know when to use this)
          </span>
        </label>
        <input
          id="skill-desc"
          placeholder="e.g. Handles questions about product returns"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="skill-content" className={labelClass}>
          Content
        </label>
        <textarea
          id="skill-content"
          placeholder="The instructions and knowledge for this skill..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          required
          className={inputClass + " font-mono text-xs"}
        />
      </div>
      <button
        type="submit"
        disabled={saving || !name.trim() || !content.trim()}
        className={btnPrimary}
      >
        {saving ? "Saving..." : skill ? "Update Skill" : "Create Skill"}
      </button>
    </form>
  );
}

type FileStatus = "pending" | "uploading" | "uploaded" | "error";

function PdfUploadForm({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileStatus>>({});
  const [globalStatus, setGlobalStatus] = useState<"idle" | "analyzing">("idle");
  const { toast } = useToast();

  const isProcessing = globalStatus === "analyzing" || Object.values(fileStatuses).some((s) => s === "uploading");

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf");
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...pdfs.filter((f) => !existing.has(f.name))];
    });
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setFileStatuses((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const setFileStatus = (name: string, status: FileStatus) =>
    setFileStatuses((prev) => ({ ...prev, [name]: status }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    // Reset statuses
    setFileStatuses(Object.fromEntries(files.map((f) => [f.name, "pending"])));

    try {
      // Step 1: get presigned URLs for all files in parallel
      const uploadMeta = await Promise.all(
        files.map((f) => getTempPdfUploadUrl({ fileName: f.name })),
      );

      // Step 2: upload all PDFs to S3 in parallel, tracking per-file status
      await Promise.all(
        files.map(async (file, i) => {
          setFileStatus(file.name, "uploading");
          const { s3UploadUrl, s3UploadFields } = uploadMeta[i];
          const formData = new FormData();
          Object.entries(s3UploadFields).forEach(([k, v]) =>
            formData.append(k, v as string),
          );
          formData.append("file", file);
          const res = await fetch(s3UploadUrl, { method: "POST", body: formData });
          if (!res.ok) {
            setFileStatus(file.name, "error");
            throw new Error(`Failed to upload ${file.name}`);
          }
          setFileStatus(file.name, "uploaded");
        }),
      );

      // Step 3: extract text + generate/enhance skills
      setGlobalStatus("analyzing");
      const s3Keys = uploadMeta.map((m) => m.s3Key);
      const skills = await generateSkillsFromPdf({ projectId, s3Keys });

      toast({
        title: `${skills.length} skill${skills.length === 1 ? "" : "s"} generated or enhanced`,
      });
      onDone();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setGlobalStatus("idle");
    }
  };

  const fileStatusIcon = (name: string) => {
    const s = fileStatuses[name];
    if (s === "uploading") return <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-orange-400" />;
    if (s === "uploaded") return <span className="shrink-0 text-xs text-green-400">✓</span>;
    if (s === "error") return <span className="shrink-0 text-xs text-red-400">✗</span>;
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pt-4">
      <p className="text-sm text-zinc-500">
        Select one or more PDF documents to analyze. Any skills that overlap
        with existing ones will be automatically enriched rather than replaced.
      </p>
      <div>
        <label htmlFor="pdf-file" className={labelClass}>
          PDF Documents
        </label>
        <div
          className={
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/[0.12] bg-[#18181c] transition-colors " +
            (files.length > 0 ? "border-orange-500/40 p-4" : "p-8 hover:border-white/20")
          }
        >
          {files.length === 0 ? (
            <>
              <FileUp className="h-8 w-8 text-zinc-500" />
              <p className="text-sm text-zinc-400">
                Drag & drop or{" "}
                <label
                  htmlFor="pdf-file"
                  className="cursor-pointer text-orange-400 underline"
                >
                  browse
                </label>
              </p>
              <p className="text-xs text-zinc-600">PDF files up to 5 MB each</p>
            </>
          ) : (
            <ul className="w-full max-h-48 space-y-2 overflow-y-auto pr-1">
              {files.map((f) => (
                <li
                  key={f.name}
                  className="flex min-w-0 items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
                >
                  {fileStatusIcon(f.name)}
                  <span className="min-w-0 flex-1 truncate text-sm text-white">{f.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.name)}
                    disabled={isProcessing}
                    className="shrink-0 text-xs text-zinc-400 underline hover:text-white disabled:opacity-40"
                  >
                    Remove
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <label
                  htmlFor="pdf-file"
                  className="cursor-pointer text-xs text-orange-400 underline"
                >
                  + Add more
                </label>
              </li>
            </ul>
          )}
          <input
            id="pdf-file"
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
            disabled={isProcessing}
          />
        </div>
      </div>

      {globalStatus === "analyzing" && (
        <p className="text-center text-xs text-zinc-400">
          <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
          Extracting content and generating skills...
        </p>
      )}

      <button
        type="submit"
        disabled={isProcessing || files.length === 0}
        className={btnPrimary}
      >
        {isProcessing ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {globalStatus === "analyzing" ? "Generating skills..." : "Uploading..."}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Skills
          </span>
        )}
      </button>
    </form>
  );
}

function GenerateSkillsForm({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) {
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const skills = await generateSkillsFromDocs({ projectId, url });
      toast({
        title: `${skills.length} skill${skills.length === 1 ? "" : "s"} generated`,
      });
      onDone();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4">
      <p className="text-sm text-zinc-500">
        Enter a documentation URL and we'll crawl it to automatically generate
        skills for your agent.
      </p>
      <div>
        <label htmlFor="gen-url" className={labelClass}>
          Documentation URL
        </label>
        <input
          id="gen-url"
          type="url"
          placeholder="https://docs.example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={generating}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={generating || !url.trim()}
        className={btnPrimary}
      >
        {generating ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating skills...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate
          </span>
        )}
      </button>
    </form>
  );
}

// ─── Integration Guide ──────────────────────────────────────────────────────

function CodeBlock({ code, language = "tsx" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl border border-white/[0.07] bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">{language}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language as any}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed" style={{ background: "transparent" }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

function IntegrationSection({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<"npm" | "script">("npm");

  const installSnippet = `npm install @orama-agent/sdk`;

  const providerSnippet = `import { OramaProvider } from '@orama-agent/sdk';

function App() {
  return (
    <OramaProvider
      config={{
        apiKey: 'YOUR_API_KEY',
        projectId: '${projectId}',
        apiUrl: 'https://api.orama.dev',
      }}
    >
      {/* Your app components */}
    </OramaProvider>
  );
}`;

  const scriptSnippet = `<script
  src="https://api.orama.dev/static/orama-widget.js"
  data-api-key="YOUR_API_KEY"
  data-project-id="${projectId}"
  data-api-url="https://api.orama.dev"
><\/script>`;

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-orange-500 text-white"
        : "text-zinc-500 text-zinc-400 hover:text-white"
    }`;

  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-1 flex items-center gap-2">
        <Code2 className="h-5 w-5 text-orange-500" />
        <h2 className="text-base font-semibold text-white">
          Integrate into Your App
        </h2>
      </div>
      <p className="mb-6 text-sm text-zinc-500">
        Add the Orama agent to your application.
      </p>

      {/* Project ID */}
      <div className="mb-6 flex items-center gap-3 rounded-lg bg-[#18181c] px-4 py-3">
        <span className="text-sm font-medium text-zinc-400">Project ID</span>
        <code className="flex-1 rounded bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300 select-all">
          {projectId}
        </code>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-full border border-white/[0.07] p-1 w-fit">
        <button className={tabClass(tab === "npm")} onClick={() => setTab("npm")}>
          npm Package
        </button>
        <button className={tabClass(tab === "script")} onClick={() => setTab("script")}>
          Script Tag
        </button>
      </div>

      {tab === "npm" ? (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-zinc-200">
              1. Install the package
            </h3>
            <CodeBlock code={installSnippet} language="bash" />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-zinc-200">
              2. Wrap your app with OramaProvider
            </h3>
            <p className="mb-3 text-sm text-zinc-500">
              Add the <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-300">OramaProvider</code> at the root of your component tree.
            </p>
            <CodeBlock code={providerSnippet} language="tsx" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">
            Add this script tag to your HTML. The widget will appear automatically as a floating button.
          </p>
          <CodeBlock code={scriptSnippet} language="html" />
          <p className="text-xs text-zinc-400">
            Replace <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs">YOUR_API_KEY</code> with your API key from the dashboard.
          </p>
        </div>
      )}
    </div>
  );
}

