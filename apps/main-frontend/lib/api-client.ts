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
  CancelExecutionResponse,
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
