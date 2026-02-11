import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProjectById,
  updateProject,
  deleteProject,
  createPrompt,
  updatePrompt,
  deletePrompt,
  generateSkillsFromDocs,
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
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500";

const btnPrimary =
  "rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50";

const btnOutline =
  "inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800";

const btnGhost =
  "rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200";

const sectionCard =
  "rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50";

const labelClass =
  "mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-200";

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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 lg:p-10">
        <p className="text-sm text-red-500">Project not found</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
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
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
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
      <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-white">
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
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
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

  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
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
    <div className="flex items-start justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          {skill.name}
        </p>
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
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
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
    <div className="relative rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-700">
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
  const installSnippet = `npm install @orama/agent`;

  const providerSnippet = `import { OramaProvider } from '@orama/agent';

function App() {
  return (
    <OramaProvider
      config={{
        apiKey: import.meta.env.REACT_APP_ORAMA_API_KEY,
        projectId: '${projectId}',
        apiUrl: import.meta.env.REACT_APP_ORAMA_API_URL,
      }}
    >
      {/* Your app components */}
    </OramaProvider>
  );
}`;

  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-1 flex items-center gap-2">
        <Code2 className="h-5 w-5 text-orange-500" />
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
          Integrate into Your App
        </h2>
      </div>
      <p className="mb-6 text-sm text-zinc-500">
        Add the Orama agent to your React application in two steps.
      </p>

      {/* Project ID */}
      <div className="mb-6 flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Project ID</span>
        <code className="flex-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 select-all">
          {projectId}
        </code>
      </div>

      <div className="flex flex-col gap-6">
        {/* Step 1 */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
            1. Install the package
          </h3>
          <CodeBlock code={installSnippet} language="bash" />
        </div>

        {/* Step 2 */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-200">
            2. Wrap your app with OramaProvider
          </h3>
          <p className="mb-3 text-sm text-zinc-500">
            Add the <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">OramaProvider</code> at the root of your component tree. The base prompt and skills you configured above will be loaded automatically from the project.
          </p>
          <CodeBlock code={providerSnippet} language="tsx" />
        </div>
      </div>
    </div>
  );
}

