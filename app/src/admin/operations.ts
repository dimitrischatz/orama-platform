import { HttpError } from "wasp/server";
import type { GetAdminDashboard, GetAdminProjectDetail, GetAdminAgentSession } from "wasp/server/operations";
import type {
  AdminDashboardListOutput,
  AdminProjectDetailOutput,
  AdminAgentSessionOutput,
  AdminProjectSummary,
} from "../shared/adminTypes";

export const getAdminDashboard: GetAdminDashboard<
  void,
  AdminDashboardListOutput
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
  const enrichedUsers = users.map((u) => ({
    ...u,
    projects: u.projects.map((p): AdminProjectSummary => ({
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
    users: enrichedUsers,
  };
};

export const getAdminProjectDetail: GetAdminProjectDetail<
  { projectId: string },
  AdminProjectDetailOutput
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  if (!context.user.isAdmin) {
    throw new HttpError(403, "Admin access required");
  }

  const project = await context.entities.Project.findUnique({
    where: { id: args.projectId },
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
        take: 50,
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
        take: 50,
      },
    },
  });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  // Get full cost aggregation for this project
  const costAgg = await context.entities.UsageRecord.aggregate({
    where: { projectId: args.projectId },
    _sum: { cost: true },
  });

  return {
    ...project,
    totalCost: costAgg._sum?.cost ?? 0,
  };
};

export const getAdminAgentSession: GetAdminAgentSession<
  { sessionId: string },
  AdminAgentSessionOutput
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  if (!context.user.isAdmin) {
    throw new HttpError(403, "Admin access required");
  }

  const logs = await context.entities.AgentLog.findMany({
    where: { sessionId: args.sessionId },
    select: {
      id: true,
      sessionId: true,
      step: true,
      goal: true,
      pageUrl: true,
      snapshotText: true,
      actions: true,
      toolResults: true,
      agentMessage: true,
      inputTokens: true,
      outputTokens: true,
      status: true,
      errorMessage: true,
      createdAt: true,
    },
    orderBy: { step: "asc" },
  });

  if (!logs.length) {
    throw new HttpError(404, "Session not found");
  }

  return {
    sessionId: args.sessionId,
    goal: logs[0].goal,
    steps: logs,
  };
};
