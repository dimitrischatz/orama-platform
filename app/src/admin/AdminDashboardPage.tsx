import { useState } from "react";
import { Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getAdminDashboard, getAdminProjectDetail, getAdminAgentSession, useQuery } from "wasp/client/operations";
import type { User } from "wasp/entities";
import {
  Users,
  FolderKanban,
  Activity,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Shield,
  Sparkles,
  FileText,
  Brain,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Globe,
  Wrench,
} from "lucide-react";
import type {
  AdminProject,
  AdminPrompt,
  AdminUserSummary,
} from "../shared/adminTypes";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage({ user }: { user: User }) {
  const { data, isLoading } = useQuery(getAdminDashboard);
  const [view, setView] = useState<
    | { type: "list" }
    | { type: "user"; user: AdminUserSummary }
    | { type: "project"; user: AdminUserSummary; projectId: string }
  >({ type: "list" });

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {isLoading || !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
        </div>
      ) : view.type === "list" ? (
        <>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="mb-8 text-sm text-zinc-500">
            Platform overview and user management
          </p>
          <StatsCards stats={data.stats} />
          <UsersTable
            users={data.users}
            onSelectUser={(u) => setView({ type: "user", user: u })}
          />
        </>
      ) : view.type === "user" ? (
        <UserDetail
          user={view.user}
          onBack={() => setView({ type: "list" })}
          onSelectProject={(projectId) =>
            setView({ type: "project", user: view.user, projectId })
          }
        />
      ) : (
        <ProjectDetailLoader
          user={view.user}
          projectId={view.projectId}
          onBack={() => setView({ type: "user", user: view.user })}
        />
      )}
    </div>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards({
  stats,
}: {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalRequests: number;
    totalCost: number;
  };
}) {
  const cards = [
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
    { label: "Projects", value: stats.totalProjects, icon: FolderKanban, color: "text-orange-400" },
    { label: "API Requests", value: stats.totalRequests.toLocaleString(), icon: Activity, color: "text-emerald-400" },
    { label: "Total Cost", value: `$${stats.totalCost.toFixed(2)}`, icon: DollarSign, color: "text-amber-400" },
  ];

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-white/[0.07] bg-[#111114] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-zinc-500">{c.label}</span>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </div>
          <p className="text-2xl font-bold text-white">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Users Table ──────────────────────────────────────────────────────────────

function UsersTable({
  users,
  onSelectUser,
}: {
  users: AdminUserSummary[];
  onSelectUser: (u: AdminUserSummary) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111114] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
        <h2 className="text-base font-semibold text-white">Users</h2>
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-white/[0.07] bg-[#18181c] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-orange-400"
        />
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.07]">
            <th className="px-6 py-3 font-medium text-zinc-500">Email</th>
            <th className="px-6 py-3 text-right font-medium text-zinc-500">Balance</th>
            <th className="px-6 py-3 text-right font-medium text-zinc-500">Projects</th>
            <th className="px-6 py-3 text-right font-medium text-zinc-500">Keys</th>
            <th className="px-6 py-3 font-medium text-zinc-500">Joined</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
              <tr
                key={u.id}
                onClick={() => onSelectUser(u)}
                className="cursor-pointer border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{u.email ?? "—"}</span>
                    {u.isAdmin && <Shield className="h-3.5 w-3.5 text-orange-500" />}
                  </div>
                </td>
                <td className="px-6 py-3 text-right text-zinc-300">${u.balance.toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-zinc-300">{u._count.projects}</td>
                <td className="px-6 py-3 text-right text-zinc-300">{u._count.apiKeys}</td>
                <td className="px-6 py-3 text-zinc-400">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
          ))}
          {!filtered.length && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── User Detail ──────────────────────────────────────────────────────────────

function UserDetail({
  user,
  onBack,
  onSelectProject,
}: {
  user: AdminUserSummary;
  onBack: () => void;
  onSelectProject: (projectId: string) => void;
}) {
  const totalCost = user.projects.reduce((sum, p) => sum + p.totalCost, 0);
  const totalRequests = user.projects.reduce((sum, p) => sum + p._count.usageRecords, 0);

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
            {(user.email ?? "U")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.email ?? "Unknown"}</h1>
            <p className="text-sm text-zinc-500">
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {user.isAdmin && <span className="ml-2 text-orange-500">Admin</span>}
            </p>
          </div>
        </div>
      </div>

      {/* User stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Credits", value: user.credits },
          { label: "Balance", value: `$${user.balance.toFixed(2)}` },
          { label: "Projects", value: user._count.projects },
          { label: "Requests", value: totalRequests.toLocaleString() },
          { label: "Cost", value: `$${totalCost.toFixed(4)}` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#111114] px-4 py-3">
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Projects list */}
      <h2 className="mb-4 text-base font-semibold text-white">Projects</h2>
      {!user.projects.length ? (
        <p className="py-6 text-center text-sm text-zinc-500">No projects</p>
      ) : (
        <div className="flex flex-col gap-3">
          {user.projects.map((p) => {
            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="cursor-pointer rounded-2xl border border-white/[0.07] bg-[#111114] p-5 transition-colors hover:border-orange-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    {p.description && (
                      <p className="mt-0.5 text-xs text-zinc-500">{p.description}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-400">
                      Created {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      {p._count.prompts} prompts
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      {p._count.usageRecords} requests
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {p._count.agentLogs} logs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      ${p.totalCost.toFixed(4)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Project Detail Loader ────────────────────────────────────────────────────

function ProjectDetailLoader({
  user,
  projectId,
  onBack,
}: {
  user: AdminUserSummary;
  projectId: string;
  onBack: () => void;
}) {
  const { data: project, isLoading } = useQuery(getAdminProjectDetail, { projectId });

  if (isLoading || !project) {
    return (
      <div>
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {user.email}
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
        </div>
      </div>
    );
  }

  return <ProjectDetail user={user} project={project} onBack={onBack} />;
}

// ─── Project Detail ───────────────────────────────────────────────────────────

function ProjectDetail({
  user,
  project,
  onBack,
}: {
  user: AdminUserSummary;
  project: AdminProject;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"prompts" | "usage" | "logs">("prompts");
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const basePrompt = project.prompts.find((p) => p.type === "base");
  const skills = project.prompts.filter((p) => p.type === "skill");
  const memories = project.prompts.filter((p) => p.type === "memory");
  const totalCost = project.totalCost;

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-orange-500 text-white" : "text-zinc-500 hover:text-white"
    }`;

  // Group agent logs by session
  const sessionMap = new Map<string, typeof project.agentLogs>();
  for (const log of project.agentLogs) {
    const existing = sessionMap.get(log.sessionId) ?? [];
    existing.push(log);
    sessionMap.set(log.sessionId, existing);
  }
  const sessions = Array.from(sessionMap.entries()).map(([id, logs]) => ({
    id,
    goal: logs[0]?.goal ?? "—",
    steps: logs.length,
    status: logs[logs.length - 1]?.status ?? "ok",
    totalTokens: logs.reduce((s, l) => s + l.inputTokens + l.outputTokens, 0),
    createdAt: logs[0]?.createdAt,
    hasError: logs.some((l) => l.status === "error"),
    errorMessage: logs.find((l) => l.errorMessage)?.errorMessage,
  }));

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {user.email}
      </button>

      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-zinc-500">{project.description}</p>
        )}
        <p className="mt-1 text-xs text-zinc-400">
          ID: <code className="rounded bg-zinc-800 px-1.5 py-0.5">{project.id}</code>
        </p>
      </div>

      {/* Project stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Prompts", value: project._count.prompts },
          { label: "Requests", value: project._count.usageRecords },
          { label: "Agent Sessions", value: sessions.length },
          { label: "Cost", value: `$${totalCost.toFixed(4)}` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#111114] px-4 py-3">
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-full border border-white/[0.07] p-1 w-fit">
        <button className={tabClass(tab === "prompts")} onClick={() => setTab("prompts")}>
          Prompts ({project._count.prompts})
        </button>
        <button className={tabClass(tab === "usage")} onClick={() => setTab("usage")}>
          Usage ({project.usageRecords.length})
        </button>
        <button className={tabClass(tab === "logs")} onClick={() => setTab("logs")}>
          Agent Logs ({sessions.length})
        </button>
      </div>

      {/* Tab content */}
      {tab === "prompts" && (
        <div className="flex flex-col gap-6">
          {/* Base prompt */}
          {basePrompt && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <FileText className="h-4 w-4 text-orange-500" />
                Base Prompt
              </h3>
              <PromptCard
                prompt={basePrompt}
                expanded={expandedPrompt === basePrompt.id}
                onToggle={() =>
                  setExpandedPrompt(expandedPrompt === basePrompt.id ? null : basePrompt.id)
                }
              />
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Sparkles className="h-4 w-4 text-orange-500" />
                Skills ({skills.length})
              </h3>
              <div className="flex flex-col gap-2">
                {skills.map((s) => (
                  <PromptCard
                    key={s.id}
                    prompt={s}
                    expanded={expandedPrompt === s.id}
                    onToggle={() =>
                      setExpandedPrompt(expandedPrompt === s.id ? null : s.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Memories */}
          {memories.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Brain className="h-4 w-4 text-orange-500" />
                Memories ({memories.length})
              </h3>
              <div className="flex flex-col gap-2">
                {memories.map((m) => (
                  <PromptCard
                    key={m.id}
                    prompt={m}
                    expanded={expandedPrompt === m.id}
                    onToggle={() =>
                      setExpandedPrompt(expandedPrompt === m.id ? null : m.id)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {!basePrompt && !skills.length && !memories.length && (
            <p className="py-6 text-center text-sm text-zinc-500">No prompts configured</p>
          )}
        </div>
      )}

      {tab === "usage" && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#111114] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="px-6 py-3 font-medium text-zinc-500">Date</th>
                <th className="px-6 py-3 font-medium text-zinc-500">Model</th>
                <th className="px-6 py-3 text-right font-medium text-zinc-500">Input Tokens</th>
                <th className="px-6 py-3 text-right font-medium text-zinc-500">Output Tokens</th>
                <th className="px-6 py-3 text-right font-medium text-zinc-500">Cost</th>
              </tr>
            </thead>
            <tbody>
              {project.usageRecords.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-6 py-3 text-zinc-300">
                    {new Date(r.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">
                      {r.model}
                    </code>
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-300">
                    {r.promptTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-300">
                    {r.completionTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-300">
                    ${r.cost.toFixed(4)}
                  </td>
                </tr>
              ))}
              {!project.usageRecords.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-500">
                    No usage records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {project.usageRecords.length > 0 && project.usageRecords.length < project._count.usageRecords && (
            <div className="border-t border-white/[0.07] px-6 py-3 text-center text-xs text-zinc-500">
              Showing {project.usageRecords.length} of {project._count.usageRecords} records
            </div>
          )}
        </div>
      )}

      {tab === "logs" && (
        selectedSessionId ? (
          <SessionDetail
            sessionId={selectedSessionId}
            onBack={() => setSelectedSessionId(null)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className="cursor-pointer rounded-xl border border-white/[0.07] bg-[#111114] p-4 transition-colors hover:border-orange-500/30"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {s.hasError ? (
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                      <p className="truncate text-sm font-medium text-white">{s.goal}</p>
                    </div>
                    {s.hasError && s.errorMessage && (
                      <p className="mt-1 ml-6 text-xs text-red-400">{s.errorMessage}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-4 text-xs text-zinc-500 shrink-0">
                    <span>{s.steps} steps</span>
                    <span>{s.totalTokens.toLocaleString()} tokens</span>
                    <span>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </div>
              </div>
            ))}
            {!sessions.length && (
              <p className="py-6 text-center text-sm text-zinc-500">No agent sessions</p>
            )}
          </div>
        )
      )}
    </div>
  );
}

// ─── Session Detail ──────────────────────────────────────────────────────────

function SessionDetail({
  sessionId,
  onBack,
}: {
  sessionId: string;
  onBack: () => void;
}) {
  const { data: session, isLoading } = useQuery(getAdminAgentSession, { sessionId });
  const [expandedRaw, setExpandedRaw] = useState<string | null>(null);

  if (isLoading || !session) {
    return (
      <div>
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sessions
        </button>
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
        </div>
      </div>
    );
  }

  const totalTokens = session.steps.reduce(
    (s, l) => s + l.inputTokens + l.outputTokens,
    0,
  );

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sessions
      </button>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-white">{session.goal}</h3>
        <p className="mt-1 text-xs text-zinc-500">
          {session.steps.length} steps · {totalTokens.toLocaleString()} tokens
        </p>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 border-l border-zinc-800 pl-6">
        {session.steps.map((step, i) => {
          const actions = step.actions ? parseActions(step.actions) : [];
          const prevUrl = i > 0 ? session.steps[i - 1].pageUrl : null;
          const prevGoal = i > 0 ? session.steps[i - 1].goal : null;
          const navigated = step.pageUrl && step.pageUrl !== prevUrl;
          const goalChanged = i === 0 || step.goal !== prevGoal;

          return (
            <div key={step.id} className="relative mb-8 last:mb-0">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  step.status === "error"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {step.step}
              </div>

              {/* User message — shown on first step and when goal changes (follow-up) */}
              {goalChanged && (
                <div className="mb-3 rounded-lg bg-blue-500/5 border border-blue-500/20 px-4 py-3">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-blue-400">
                    {i === 0 ? "User" : "User follow-up"}
                  </p>
                  <p className="text-sm text-zinc-200">{step.goal}</p>
                </div>
              )}

              {/* Page navigation */}
              {navigated && (
                <div className="mb-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Globe className="h-3 w-3" />
                  Navigated to <span className="text-zinc-300">{step.pageUrl}</span>
                </div>
              )}

              {/* Actions as readable pills */}
              {actions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {actions.map((action, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-1 text-xs text-orange-300"
                    >
                      <Wrench className="h-3 w-3" />
                      {action}
                    </span>
                  ))}
                </div>
              )}

              {/* Tool results — compact collapsible */}
              {step.toolResults && (
                <details className="mb-2 rounded-lg bg-blue-500/5 border border-blue-500/10 overflow-hidden group">
                  <summary className="flex items-center gap-1.5 px-3 py-2 text-xs text-blue-400 cursor-pointer select-none hover:bg-blue-500/5">
                    <Activity className="h-3 w-3" />
                    Tool Results
                    <ChevronRight className="h-3 w-3 ml-auto transition-transform group-open:rotate-90" />
                  </summary>
                  <pre className="px-3 pb-3 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-400 max-h-60 overflow-y-auto">
                    {formatJson(step.toolResults)}
                  </pre>
                </details>
              )}

              {/* Agent message */}
              {step.agentMessage && (
                <div className="rounded-lg bg-[#111114] border border-white/[0.07] px-4 py-3 mb-2 prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:bg-[#0d0d10] prose-pre:border prose-pre:border-white/[0.05] prose-code:text-orange-300 prose-a:text-blue-400 prose-headings:text-zinc-100">
                  <ReactMarkdown>{step.agentMessage}</ReactMarkdown>
                </div>
              )}

              {/* Error */}
              {step.errorMessage && (
                <div className="rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-3 mb-2">
                  <p className="flex items-center gap-1.5 text-sm text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {step.errorMessage}
                  </p>
                </div>
              )}

              {/* Page snapshot + raw data */}
              <div className="flex items-center gap-3 mt-1">
                {step.snapshotText && (
                  <button
                    onClick={() => setExpandedRaw(
                      expandedRaw === `snapshot-${step.id}` ? null : `snapshot-${step.id}`
                    )}
                    className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {expandedRaw === `snapshot-${step.id}` ? "Hide page snapshot" : "Page snapshot"}
                  </button>
                )}
                <button
                  onClick={() => setExpandedRaw(
                    expandedRaw === `raw-${step.id}` ? null : `raw-${step.id}`
                  )}
                  className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {expandedRaw === `raw-${step.id}` ? "Hide raw data" : "Raw data"}
                </button>
                <span className="text-[11px] text-zinc-700">
                  {step.inputTokens.toLocaleString()} in · {step.outputTokens.toLocaleString()} out
                </span>
              </div>

              {/* Page snapshot panel */}
              {expandedRaw === `snapshot-${step.id}` && step.snapshotText && (
                <div className="mt-2 rounded-lg bg-[#0d0d10] border border-white/[0.05] overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/[0.05] flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-zinc-500" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      What the agent saw
                    </span>
                  </div>
                  <pre className="p-3 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-400 max-h-96 overflow-y-auto">
                    {step.snapshotText}
                  </pre>
                </div>
              )}

              {/* Raw data panel */}
              {expandedRaw === `raw-${step.id}` && (
                <div className="mt-2 rounded-lg bg-[#0d0d10] border border-white/[0.05] p-3 overflow-x-auto">
                  {step.actions && (
                    <div className="mb-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">Actions</p>
                      <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-400">
                        {formatJson(step.actions)}
                      </pre>
                    </div>
                  )}
                  {step.toolResults && (
                    <div className="mb-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">Tool Results</p>
                      <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-400">
                        {formatJson(step.toolResults)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Extract human-readable action summaries from the JSON actions string */
function parseActions(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map((a) => {
      if (typeof a === "string") return a;
      // Common patterns: { type: "click", selector: "..." } or { tool: "navigate", ... }
      const name = a.type || a.tool || a.action || a.name || "action";
      const target = a.selector || a.url || a.text || a.value || "";
      return target ? `${name}: ${target}` : name;
    });
  } catch {
    return [raw.slice(0, 80)];
  }
}

function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

// ─── Prompt Card ──────────────────────────────────────────────────────────────

function PromptCard({
  prompt,
  expanded,
  onToggle,
}: {
  prompt: AdminPrompt;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#18181c] overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">{prompt.name}</p>
          {prompt.description && (
            <p className="mt-0.5 text-xs text-zinc-500">{prompt.description}</p>
          )}
        </div>
        <div className="ml-4 flex items-center gap-3 shrink-0">
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {prompt.type}
          </span>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-white/[0.07] px-4 py-3">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
            {prompt.content}
          </pre>
        </div>
      )}
    </div>
  );
}
