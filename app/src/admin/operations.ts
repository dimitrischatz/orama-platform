import { HttpError } from "wasp/server";
import type { GetAdminDashboard } from "wasp/server/operations";

type AdminPrompt = {
  id: string;
  name: string;
  description: string | null;
  content: string;
  type: string;
  createdAt: Date;
};

type AdminAgentLog = {
  id: string;
  sessionId: string;
  step: number;
  goal: string;
  pageUrl: string | null;
  status: string;
  errorMessage: string | null;
  inputTokens: number;
  outputTokens: number;
  createdAt: Date;
};

type AdminUsageRecord = {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  createdAt: Date;
};

type AdminProject = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCost: number;
  prompts: AdminPrompt[];
  usageRecords: AdminUsageRecord[];
  agentLogs: AdminAgentLog[];
  _count: {
    prompts: number;
    usageRecords: number;
    agentLogs: number;
  };
};

type AdminUser = {
  id: string;
  email: string | null;
  createdAt: Date;
  credits: number;
  balance: number;
  isAdmin: boolean;
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  _count: {
    projects: number;
    apiKeys: number;
  };
  projects: AdminProject[];
};

type AdminDashboardOutput = {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalRequests: number;
    totalCost: number;
  };
  users: AdminUser[];
};

export const getAdminDashboard: GetAdminDashboard<
  void,
  AdminDashboardOutput
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  if (!context.user.isAdmin) {
    throw new HttpError(403, "Admin access required");
  }

  const [users, totalProjects, usageAgg, projectCosts] = await Promise.all([
    context.entities.User.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        credits: true,
        balance: true,
        isAdmin: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        _count: {
          select: {
            projects: true,
            apiKeys: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            _count: {
              select: {
                prompts: true,
                usageRecords: true,
                agentLogs: true,
              },
            },
            prompts: {
              select: {
                id: true,
                name: true,
                description: true,
                content: true,
                type: true,
                createdAt: true,
              },
              orderBy: { createdAt: "asc" },
            },
            usageRecords: {
              select: {
                id: true,
                model: true,
                promptTokens: true,
                completionTokens: true,
                cost: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 20,
            },
            agentLogs: {
              select: {
                id: true,
                sessionId: true,
                step: true,
                goal: true,
                pageUrl: true,
                status: true,
                errorMessage: true,
                inputTokens: true,
                outputTokens: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 30,
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    context.entities.Project.count(),
    context.entities.UsageRecord.aggregate({
      _count: true,
      _sum: { cost: true },
    }),
    context.entities.UsageRecord.groupBy({
      by: ["projectId"],
      _sum: { cost: true },
    }),
  ]);

  // Build a map of projectId -> total cost from the full aggregation
  const costByProject = new Map<string, number>();
  for (const row of projectCosts) {
    costByProject.set(row.projectId, row._sum?.cost ?? 0);
  }

  // Attach totalCost to each project
  const enrichedUsers = users.map((u: any) => ({
    ...u,
    projects: u.projects.map((p: any) => ({
      ...p,
      totalCost: costByProject.get(p.id) ?? 0,
    })),
  }));

  return {
    stats: {
      totalUsers: users.length,
      totalProjects,
      totalRequests: usageAgg._count ?? 0,
      totalCost: usageAgg._sum?.cost ?? 0,
    },
    users: enrichedUsers as unknown as AdminUser[],
  };
};
