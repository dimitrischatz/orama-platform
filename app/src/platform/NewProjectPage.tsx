import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "wasp/client/operations";
import type { User } from "wasp/entities";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../client/hooks/use-toast";

export default function NewProjectPage(_props: { user: User }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast({ title: "Project created" });
      navigate(`/dashboard/projects/${project.id}`);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        New Project
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Set up a new Orama agent for your application
      </p>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800/50">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-200"
            >
              Name
            </label>
            <input
              id="name"
              placeholder="My App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-zinc-200"
            >
              Description{" "}
              <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <textarea
              id="description"
              placeholder="What is this project for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
