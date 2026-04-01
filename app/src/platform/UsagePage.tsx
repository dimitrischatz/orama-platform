import { useState } from "react";
import { getProjects, getProjectUsage, useQuery } from "wasp/client/operations";
import type { User } from "wasp/entities";
import { BarChart3 } from "lucide-react";

// ─── Shared styles ──────────────────────────────────────────────────────────

const sectionCard =
  "rounded-2xl border border-white/[0.07] bg-[#111114]";

// ─── Colors for per-project bars ────────────────────────────────────────────

const PROJECT_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
];

const PROJECT_COLORS_TEXT = [
  "text-orange-500",
  "text-blue-500",
  "text-emerald-500",
  "text-violet-500",
  "text-pink-500",
  "text-amber-500",
  "text-cyan-500",
  "text-rose-500",
];

function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function UsagePage({ user }: { user: User }) {
  const [filterProjectId, setFilterProjectId] = useState<string>("");
  const { data: projects } = useQuery(getProjects);
  const { data: usage, isLoading } = useQuery(getProjectUsage, {
    projectId: filterProjectId || undefined,
  });

  // Build a stable color map for projects
  const projectColorMap = new Map<string, number>();
  (projects ?? []).forEach((p, i) => {
    projectColorMap.set(p.id, i % PROJECT_COLORS.length);
  });

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">
        Usage
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Usage and costs across your projects
      </p>

      <UsageFilter
        projects={projects ?? []}
        filterProjectId={filterProjectId}
        onFilter={setFilterProjectId}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
        </div>
      ) : !usage?.length ? (
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4">
            <StatCard label="Balance" value={formatCost(user.balance ?? 0)} />
          </div>
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-[#111114] py-16 text-center">
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-300">
              No usage data yet
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Usage will appear here once your API starts processing requests.
            </p>
          </div>
        </div>
      ) : (
        <UsageContent
          usage={usage}
          projects={projects ?? []}
          projectColorMap={projectColorMap}
          filterProjectId={filterProjectId}
          balance={user.balance ?? 0}
        />
      )}
    </div>
  );
}

// ─── Usage Content ──────────────────────────────────────────────────────────

type DailyProjectUsage = {
  date: string;
  projectId: string;
  projectName: string;
  requests: number;
  cost: number;
};

type ChartMode = "cost" | "responses";

function UsageContent({
  usage,
  projects,
  projectColorMap,
  filterProjectId,
  balance,
}: {
  usage: DailyProjectUsage[];
  projects: { id: string; name: string }[];
  projectColorMap: Map<string, number>;
  filterProjectId: string;
  balance: number;
}) {
  const [chartMode, setChartMode] = useState<ChartMode>("cost");

  const totals = usage.reduce(
    (acc, row) => ({
      requests: acc.requests + row.requests,
      cost: acc.cost + row.cost,
    }),
    { requests: 0, cost: 0 },
  );

  // Group by date for the bar chart, stacking projects
  const dates = [...new Set(usage.map((r) => r.date))].sort();

  const getDayValue = (dayRows: DailyProjectUsage[]) =>
    dayRows.reduce((sum, r) => sum + (chartMode === "cost" ? r.cost : r.requests), 0);

  const getRowValue = (row: DailyProjectUsage) =>
    chartMode === "cost" ? row.cost : row.requests;

  const maxValue = Math.max(
    ...dates.map((d) => getDayValue(usage.filter((r) => r.date === d))),
  );

  const formatValue = (v: number) =>
    chartMode === "cost" ? formatCost(v) : v.toLocaleString();

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Balance" value={formatCost(balance)} />
        <StatCard label="Total Responses" value={totals.requests.toLocaleString()} />
      </div>

      {/* Bar chart */}
      <div className={sectionCard + " p-6"}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">
            {chartMode === "cost" ? "Daily Cost" : "Daily Responses"}
          </h3>
          <div className="flex rounded-lg border border-white/[0.07]">
            <button
              onClick={() => setChartMode("cost")}
              className={`rounded-l-lg px-3 py-1 text-xs font-medium transition-colors ${
                chartMode === "cost"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Cost
            </button>
            <button
              onClick={() => setChartMode("responses")}
              className={`rounded-r-lg px-3 py-1 text-xs font-medium transition-colors ${
                chartMode === "responses"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Responses
            </button>
          </div>
        </div>
        <div className="flex items-end gap-2" style={{ height: 200 }}>
          {dates.map((date) => {
            const dayRows = usage.filter((r) => r.date === date);
            const dayTotal = getDayValue(dayRows);
            const heightPct = maxValue > 0 ? (dayTotal / maxValue) * 100 : 0;

            return (
              <div
                key={date}
                className="group relative flex flex-col items-stretch justify-end"
                style={{ height: "100%", flex: "1 1 0%", maxWidth: 64 }}
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-white group-hover:block bg-zinc-700">
                  {formatValue(dayTotal)}
                </div>
                {/* Stacked bar */}
                <div
                  className="flex flex-col justify-end overflow-hidden rounded-t"
                  style={{ height: `${heightPct}%`, minHeight: dayTotal > 0 ? 4 : 0 }}
                >
                  {dayRows.map((row) => {
                    const rowVal = getRowValue(row);
                    const rowPct = dayTotal > 0 ? (rowVal / dayTotal) * 100 : 0;
                    const colorIdx = projectColorMap.get(row.projectId) ?? 0;
                    return (
                      <div
                        key={row.projectId}
                        className={`${PROJECT_COLORS[colorIdx]} w-full`}
                        style={{ height: `${rowPct}%`, minHeight: rowVal > 0 ? 2 : 0 }}
                      />
                    );
                  })}
                </div>
                {/* Date label */}
                <p className="mt-1 text-center text-[10px] text-zinc-400">
                  {date.slice(5)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {!filterProjectId && projects.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {projects.map((p, i) => {
              const colorIdx = i % PROJECT_COLORS.length;
              return (
                <div key={p.id} className="flex items-center gap-1.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${PROJECT_COLORS[colorIdx]}`} />
                  <span className="text-xs text-zinc-500">{p.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <div className={sectionCard + " overflow-hidden"}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.07]">
              <th className="px-6 py-3 font-medium text-zinc-500">Date</th>
              <th className="px-6 py-3 font-medium text-zinc-500">Project</th>
              <th className="px-6 py-3 text-right font-medium text-zinc-500">Responses</th>
              <th className="px-6 py-3 text-right font-medium text-zinc-500">Cost</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((row) => {
              const colorIdx = projectColorMap.get(row.projectId) ?? 0;
              return (
                <tr
                  key={`${row.date}:${row.projectId}`}
                  className="border-b border-white/[0.05] last:border-0"
                >
                  <td className="px-6 py-3 text-white">{row.date}</td>
                  <td className="px-6 py-3">
                    <span className={`text-sm font-medium ${PROJECT_COLORS_TEXT[colorIdx]}`}>
                      {row.projectName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-300">
                    {row.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-zinc-300">
                    {formatCost(row.cost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function UsageFilter({
  projects,
  filterProjectId,
  onFilter,
}: {
  projects: { id: string; name: string }[];
  filterProjectId: string;
  onFilter: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-zinc-500">Filter by project</label>
      <select
        value={filterProjectId}
        onChange={(e) => onFilter(e.target.value)}
        className="rounded-lg border border-white/[0.07] bg-[#18181c] py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={sectionCard + " p-5"}>
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
