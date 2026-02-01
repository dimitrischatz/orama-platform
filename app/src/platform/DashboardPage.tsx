import { Link } from "react-router-dom";
import { getProjects, useQuery } from "wasp/client/operations";
import { routes } from "wasp/client/router";
import type { User } from "wasp/entities";
import { Plus, FolderKanban, ArrowRight } from "lucide-react";

export default function DashboardPage(_props: { user: User }) {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Projects
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Manage your Orama agent projects
      </p>

      <ProjectsSection />
    </div>
  );
}

function ProjectsSection() {
  const { data: projects, isLoading } = useQuery(getProjects);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div />
        <Link to={routes.NewProjectRoute.to}>
          <button className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500" />
        </div>
      ) : !projects?.length ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
          <FolderKanban className="mx-auto mb-4 h-10 w-10 text-zinc-400" />
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No projects yet
          </p>
          <p className="mb-6 text-sm text-zinc-400">
            Create a project to start configuring your agent
          </p>
          <Link to={routes.NewProjectRoute.to}>
            <button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
              Create your first project
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/dashboard/projects/${project.id}`}
              className="group block"
            >
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-orange-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-orange-500/30">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <FolderKanban className="h-5 w-5 text-orange-500" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-zinc-500">
                    {project.description}
                  </p>
                )}
                <p className="text-xs text-zinc-400">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
