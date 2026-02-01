import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProjectById,
  updateProject,
  deleteProject,
  createPrompt,
  updatePrompt,
  deletePrompt,
  addDocSource,
  removeDocSource,
  useQuery,
} from "wasp/client/operations";
import type { User, Prompt, DocSource } from "wasp/entities";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Pencil,
  X,
  FileText,
  Sparkles,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../client/components/ui/dialog";
import { useToast } from "../client/hooks/use-toast";

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
          onClick={() => navigate("/dashboard")}
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
      navigate("/dashboard");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-10">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
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
        <DocSourcesSection
          projectId={project.id}
          docSources={project.docSources}
        />
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

  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Skills
          </h2>
        </div>
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

// ─── Doc Sources ────────────────────────────────────────────────────────────

function DocSourcesSection({
  projectId,
  docSources,
}: {
  projectId: string;
  docSources: DocSource[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-orange-500" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Doc Sources
          </h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className={btnOutline}>
              <Plus className="h-4 w-4" />
              Add Source
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Doc Source</DialogTitle>
            </DialogHeader>
            <DocSourceForm
              projectId={projectId}
              onDone={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <p className="mb-6 text-sm text-zinc-500">
        Documentation URLs the agent will index and use for answers.
      </p>

      {!docSources.length ? (
        <p className="py-6 text-center text-sm text-zinc-400">
          No doc sources yet
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {docSources.map((ds) => (
            <DocSourceRow key={ds.id} docSource={ds} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocSourceRow({ docSource }: { docSource: DocSource }) {
  const { toast } = useToast();

  const handleRemove = async () => {
    try {
      await removeDocSource({ id: docSource.id });
      toast({ title: "Doc source removed" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
            {docSource.label || docSource.url}
          </p>
          <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {docSource.type}
          </span>
        </div>
        {docSource.label && (
          <p className="mt-1 truncate text-xs text-zinc-400">{docSource.url}</p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="ml-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DocSourceForm({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState("docs");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDocSource({
        projectId,
        url,
        label: label || undefined,
        type,
      });
      toast({ title: "Doc source added" });
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
        <label htmlFor="ds-url" className={labelClass}>
          URL
        </label>
        <input
          id="ds-url"
          type="url"
          placeholder="https://docs.example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="ds-label" className={labelClass}>
          Label{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="ds-label"
          placeholder="e.g. API Reference"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="ds-type" className={labelClass}>
          Type
        </label>
        <select
          id="ds-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          <option value="docs">Docs</option>
          <option value="sitemap">Sitemap</option>
          <option value="api">API</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={saving || !url.trim()}
        className={btnPrimary}
      >
        {saving ? "Adding..." : "Add Source"}
      </button>
    </form>
  );
}
