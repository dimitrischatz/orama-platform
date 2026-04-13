export type AdminPrompt = {
  id: string;
  name: string;
  description: string | null;
  content: string;
  type: string;
  source: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  updatedBy: string | null;
};

export type AdminAgentLog = {
  sessionId: string;
  step: number;
  goal: string;
  status: string;
  errorMessage: string | null;
  inputTokens: number;
  outputTokens: number;
  skillIds: string | null;
  createdAt: Date;
};

/** Full agent log step with conversation content */
export type AdminAgentLogDetail = AdminAgentLog & {
  id: string;
  pageUrl: string | null;
  snapshotText: string | null;
  actions: string | null;
  toolResults: string | null;
  agentMessage: string | null;
};

export type AdminUsageRecord = {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  createdAt: Date;
};

export type AdminProject = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCost: number;
  prompts: AdminPrompt[];
  usageRecords: AdminUsageRecord[];
  agentLogs: AdminAgentLog[];
  _count: { prompts: number; usageRecords: number; agentLogs: number };
};

export type AdminUser = {
  id: string;
  email: string | null;
  createdAt: Date;
  credits: number;
  balance: number;
  isAdmin: boolean;
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  _count: { projects: number; apiKeys: number };
  projects: AdminProject[];
};

export type AdminDashboardOutput = {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalRequests: number;
    totalCost: number;
  };
  users: AdminUser[];
};

/** Lightweight user for list view (no nested project details) */
export type AdminUserSummary = Omit<AdminUser, "projects"> & {
  projects: AdminProjectSummary[];
};

/** Lightweight project for list view (no prompts/usage/logs) */
export type AdminProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCost: number;
  _count: { prompts: number; usageRecords: number; agentLogs: number };
};

export type AdminDashboardListOutput = {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalRequests: number;
    totalCost: number;
  };
  users: AdminUserSummary[];
};

export type AdminProjectDetailOutput = AdminProject;

export type AdminAgentSessionOutput = {
  sessionId: string;
  goal: string;
  steps: AdminAgentLogDetail[];
};
