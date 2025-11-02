import axios from "axios";
import { authSchema } from "@/types";
import { z } from "zod";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  ContinueConversationRequest,
  ContinueConversationResponse,
  GetConversationResponse,
  GetExecutionStatusResponse,
  GetExecutionLogsResponse,
  GetProjectExecutionsResponse,
  GetProjectFileResponse,
  CancelExecutionResponse,
  GetAllProjectsResponse,
} from "@/types/api";

const primaryBackendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRIMARY_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const workerBackendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WORKER_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const websocketClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getToken = (): string | null => {
  if (typeof window !== "undefined") return localStorage.getItem("auth-token");
  return null;
};

export type RegisterPayload = z.infer<typeof authSchema>;
export type LoginPayload = z.infer<typeof authSchema>;

// Adjust these response types to match your backend contracts when available
export type ProfileResponse = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export type PracticeResponse = unknown;

export const register = async (data: RegisterPayload): Promise<unknown> => {
  const response = await apiClient.primary.post<unknown>(
    "/api/auth/register",
    data
  );
  return response.data;
};

export const login = async (data: LoginPayload): Promise<unknown> => {
  const response = await apiClient.primary.post<unknown>(
    "/api/auth/login",
    data
  );
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem("auth-token");
};

export const googleSignin = async () => {
  const PRIMARY_BACKEND_URL = process.env.NEXT_PUBLIC_PRIMARY_BACKEND_URL!;
  window.location.href = `${PRIMARY_BACKEND_URL}/api/auth/google/oauth`;
};

export const getPracticeData = async (): Promise<PracticeResponse> => {
  const token = getToken();
  const response = await apiClient.primary.get<PracticeResponse>(
    "/api/practice",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const token = getToken();
  const response = await apiClient.primary.get<ProfileResponse>(
    "/api/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const apiClient = {
  primary: primaryBackendClient,
  worker: workerBackendClient,
  websocket: websocketClient,
};

// ============================================================================
// Worker Backend API - Project & Execution Management
// ============================================================================

/**
 * Create a new project and start code generation
 */
export const createProject = async (
  payload: CreateProjectRequest
): Promise<CreateProjectResponse> => {
  const token = getToken();
  const res = await apiClient.worker.post<CreateProjectResponse>(
    "/api/projects/create",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Get full conversation history and project metadata
 */
export const getConversation = async (
  projectId: string
): Promise<GetConversationResponse> => {
  const token = getToken();
  const res = await apiClient.worker.get<GetConversationResponse>(
    `/api/projects/${projectId}/conversation`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Continue an existing conversation with a new message
 */
export const continueConversation = async (
  projectId: string,
  payload: ContinueConversationRequest
): Promise<ContinueConversationResponse> => {
  const token = getToken();
  const res = await apiClient.worker.post<ContinueConversationResponse>(
    `/api/projects/${projectId}/conversation`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Get detailed status of a specific execution
 */
export const getExecutionStatus = async (
  executionId: string
): Promise<GetExecutionStatusResponse> => {
  const token = getToken();
  const res = await apiClient.worker.get<GetExecutionStatusResponse>(
    `/api/projects/execution/${executionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Get paginated logs for an execution
 */
export const getExecutionLogs = async (
  executionId: string,
  after?: string
): Promise<GetExecutionLogsResponse> => {
  const token = getToken();
  const res = await apiClient.worker.get<GetExecutionLogsResponse>(
    `/api/projects/execution/${executionId}/logs`,
    {
      params: { after },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Get all executions for a project
 */
export const getProjectExecutions = async (
  projectId: string
): Promise<GetProjectExecutionsResponse> => {
  const token = getToken();
  const res = await apiClient.worker.get<GetProjectExecutionsResponse>(
    `/api/projects/${projectId}/executions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Download a specific artifact file
 */
export const downloadArtifact = async (
  artifactId: string
): Promise<Blob> => {
  const token = getToken();
  const res = await apiClient.worker.get<Blob>(
    `/api/projects/artifact/${artifactId}/download`,
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Get file content by project ID and file path
 * More robust than fetching by execution ID
 */
export const getProjectFile = async (
  projectId: string,
  filePath: string
): Promise<GetProjectFileResponse> => {
  const token = getToken();
  const res = await apiClient.worker.get<GetProjectFileResponse>(
    `/api/projects/${projectId}/file`,
    {
      params: { filePath },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Cancel a running execution
 */
export const cancelExecution = async (
  executionId: string
): Promise<CancelExecutionResponse> => {
  const token = getToken();
  const res = await apiClient.worker.post<CancelExecutionResponse>(
    `/api/projects/execution/${executionId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Get all projects for the authenticated user
 */
export const getAllProjects = async (): Promise<GetAllProjectsResponse> => {
  const token = getToken();
  const res = await apiClient.worker.get<GetAllProjectsResponse>(
    "/api/projects",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// ==================== Practice/DSA API ====================

import type {
  DSAProblem,
  DSASubmission,
  PistonRuntime,
  ExecutionResult,
  PracticeStats,
  ProblemFilters,
} from "@/types/practice";

/**
 * Get all DSA problems with optional filters
 */
export async function getProblems(
  filters?: ProblemFilters
): Promise<{ message: string; data: DSAProblem[] }> {
  const params = new URLSearchParams();
  if (filters?.difficulty) params.append("difficulty", filters.difficulty);
  if (filters?.tags) params.append("tags", filters.tags.join(","));
  if (filters?.solved !== undefined)
    params.append("solved", String(filters.solved));
  if (filters?.search) params.append("search", filters.search);

  const token = getToken();
  const res = await primaryBackendClient.get(`/api/problems?${params}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

/**
 * Get a single problem by slug
 */
export async function getProblemBySlug(
  slug: string
): Promise<{ message: string; data: DSAProblem }> {
  const token = getToken();
  const res = await primaryBackendClient.get(`/api/problems/${slug}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

/**
 * Execute code without saving (preview mode)
 */
export async function executeCode(data: {
  language: string;
  version?: string;
  code: string;
  stdin?: string;
}): Promise<{ message: string; data: ExecutionResult }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.post("/api/submissions/execute", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Submit code for a problem
 */
export async function submitCode(data: {
  problemId: string;
  language: string;
  version?: string;
  code: string;
}): Promise<{ message: string; data: DSASubmission }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.post("/api/submissions/submit", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Get all submissions for the current user
 */
export async function getAllSubmissions(params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  message: string;
  data: {
    submissions: DSASubmission[];
    total: number;
    limit: number;
    offset: number;
  };
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.offset) queryParams.append("offset", String(params.offset));

  const res = await primaryBackendClient.get(
    `/api/submissions?${queryParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Get a specific submission by ID
 */
export async function getSubmission(
  id: string
): Promise<{ message: string; data: DSASubmission }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get(`/api/submissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Get submissions for a specific problem
 */
export async function getSubmissionsByProblem(
  problemId: string
): Promise<{ message: string; data: DSASubmission[] }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get(
    `/api/submissions/problem/${problemId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Get available Piston runtimes
 */
export async function getRuntimes(): Promise<{
  message: string;
  data: PistonRuntime[];
}> {
  const res = await primaryBackendClient.get("/api/submissions/runtimes/list");
  return res.data;
}

/**
 * Get user's practice statistics
 */
export async function getPracticeStats(): Promise<{
  message: string;
  data: PracticeStats;
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get("/api/problems/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ==================== DASHBOARD API ====================

export interface DashboardStats {
  overview: {
    totalProjects: number;
    projectsLastWeek: number;
    projectsGrowth: string;
    totalExecutions: number;
    executionsLastMonth: number;
    executionsGrowth: string;
    totalCodeFiles: number;
    successRate: number;
    completedExecutions: number;
    failedExecutions: number;
    totalDSASubmissions: number;
    acceptedDSASubmissions: number;
    dsaSuccessRate: string;
    totalPosts: number;
  };
  activityData: Array<{
    date: string;
    desktop: number;
    mobile: number;
  }>;
}

export interface RecentProject {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
  createdAt: Date;
  updatedAt: Date;
  executionId?: string;
  executionCount: number;
  promptCount: number;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<{
  success: boolean;
  data: DashboardStats;
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get("/api/dashboard/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Get recent projects for dashboard table
 */
export async function getRecentProjects(limit = 10): Promise<{
  success: boolean;
  projects: RecentProject[];
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get(
    `/api/dashboard/recent-projects?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

// ==================== TEAMS API ====================

import type {
  User,
  ProjectInvitation,
  ProjectMember,
  Notification,
} from "@/types/teams";

/**
 * Search users by name or email
 */
export async function searchUsers(
  query: string,
  limit = 20
): Promise<{ success: boolean; users: User[] }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get(
    `/api/teams/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Send project invitation
 */
export async function sendProjectInvitation(payload: {
  projectId: string;
  receiverId: string;
  role?: "MEMBER";
  message?: string;
}): Promise<{ success: boolean; invitation: ProjectInvitation }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.post("/api/teams/invitations", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Get received invitations
 */
export async function getReceivedInvitations(): Promise<{
  success: boolean;
  invitations: ProjectInvitation[];
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get("/api/teams/invitations/received", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Get sent invitations
 */
export async function getSentInvitations(): Promise<{
  success: boolean;
  invitations: ProjectInvitation[];
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get("/api/teams/invitations/sent", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Accept invitation
 */
export async function acceptInvitation(
  invitationId: string
): Promise<{ success: boolean; project: any; member: ProjectMember }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.post(
    `/api/teams/invitations/${invitationId}/accept`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Reject invitation
 */
export async function rejectInvitation(
  invitationId: string
): Promise<{ success: boolean }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.post(
    `/api/teams/invitations/${invitationId}/reject`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Cancel invitation (for sender)
 */
export async function cancelInvitation(
  invitationId: string
): Promise<{ success: boolean }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.delete(
    `/api/teams/invitations/${invitationId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Get project members
 */
export async function getProjectMembers(
  projectId: string
): Promise<{ success: boolean; members: ProjectMember[] }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.get(
    `/api/teams/projects/${projectId}/members`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Remove member from project (owner only)
 */
export async function removeMember(
  projectId: string,
  memberId: string
): Promise<{ success: boolean }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.delete(
    `/api/teams/projects/${projectId}/members/${memberId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Update member role (owner only)
 */
export async function updateMemberRole(
  projectId: string,
  memberId: string,
  role: "OWNER" | "MEMBER"
): Promise<{ success: boolean; member: ProjectMember }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.patch(
    `/api/teams/projects/${projectId}/members/${memberId}/role`,
    { role },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Leave project (member only)
 */
export async function leaveProject(
  projectId: string
): Promise<{ success: boolean }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.post(
    `/api/teams/projects/${projectId}/leave`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Get user notifications
 */
export async function getNotifications(params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<{
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  if (params?.unreadOnly) queryParams.append("unreadOnly", "true");

  const res = await primaryBackendClient.get(
    `/api/teams/notifications?${queryParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<{ success: boolean }> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.patch(
    `/api/teams/notifications/${notificationId}/read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<{
  success: boolean;
  count: number;
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required");

  const res = await primaryBackendClient.patch(
    "/api/teams/notifications/read-all",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

