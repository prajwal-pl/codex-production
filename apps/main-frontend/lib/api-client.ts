import axios from "axios";
import { authSchema } from "@/types";
import { z } from "zod";

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

// Worker endpoints
export type CreateProjectRequest = {
  prompt: string;
  projectId?: string;
};

export type CreateProjectResponse = {
  projectId: string;
  message: string;
  content: string;
};

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

// Get project by ID
export const getProject = async (projectId: string) => {
  const token = getToken();
  const res = await apiClient.worker.get(`/api/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Get project messages/prompts
export const getProjectMessages = async (projectId: string) => {
  const token = getToken();
  const res = await apiClient.worker.get(`/api/projects/${projectId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Continue conversation
export type ContinueConversationRequest = {
  projectId: string;
  message: string;
};

export type ContinueConversationResponse = {
  executionId: string;
  message: string;
};

export const continueConversation = async (
  payload: ContinueConversationRequest
): Promise<ContinueConversationResponse> => {
  const token = getToken();
  const res = await apiClient.worker.post<ContinueConversationResponse>(
    "/api/projects/continue",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// Get project files
export const getProjectFiles = async (projectId: string): Promise<string[]> => {
  const token = getToken();
  const res = await apiClient.worker.get<string[]>(
    `/api/projects/${projectId}/files`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
