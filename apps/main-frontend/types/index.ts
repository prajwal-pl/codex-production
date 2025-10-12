import { z } from "zod";

export const authSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be at most 50 characters." })
    .optional(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6).max(100),
});

// Editor types
export interface FileItem {
  path: string;
  type: 'file' | 'directory';
  children?: FileItem[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: {
    filesChanged?: string[];
    executionId?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  activeSandboxId?: string;
  currentExecutionId?: string;
  previewUrl?: string;
}

export interface CodeExecution {
  id: string;
  projectId: string;
  status: 'PENDING' | 'RUNNING' | 'STREAMING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  generatedCode?: string;
  stdout?: string;
  stderr?: string;
  error?: string;
  previewUrl?: string;
  createdFiles: string[];
  createdAt: string;
  completedAt?: string;
}

// Re-export API types for convenience
export type {
  JobStatus,
  PromptRole,
  CreateProjectRequest,
  CreateProjectResponse,
  ContinueConversationRequest,
  ContinueConversationResponse,
  ConversationPrompt,
  ConversationData,
  GetConversationResponse,
  ExecutionSummary,
  ExecutionDetails,
  GetExecutionStatusResponse,
} from './api';
