/**
 * API Types - Aligned with worker-backend contracts
 * These types mirror the backend response/request structures
 */

// Job/Execution status from Prisma schema
export type JobStatus =
    | 'PENDING'
    | 'RUNNING'
    | 'STREAMING'
    | 'EXECUTING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';

export type PromptRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

// Base API response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// Project creation
export interface CreateProjectRequest {
    prompt: string;
    projectId?: string;
}

export interface CreateProjectResponse {
    success: boolean;
    projectId: string;
    executionId: string;
    status: string;
    message: string;
}

// Continue conversation
export interface ContinueConversationRequest {
    message: string;
}

export interface ContinueConversationResponse {
    success: true;
    data: {
        projectId: string;
        executionId: string;
        jobId: string;
        conversationTurn: number;
        message: string;
    };
}

// Conversation history
export interface ConversationPrompt {
    id: string;
    role: PromptRole;
    content: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
    execution?: {
        id: string;
        status: JobStatus;
        previewUrl?: string;
        changedFiles?: string[];
        diffSummary?: string;
    } | null;
}

export interface ConversationData {
    project: {
        id: string;
        title: string;
        description?: string;
        previewUrl?: string;
        activeSandboxId?: string;
        conversationContext?: Record<string, unknown>;
    };
    conversation: ConversationPrompt[];
    executions: ExecutionSummary[];
}

export interface GetConversationResponse {
    success: true;
    data: ConversationData;
}

// Execution status
export interface ExecutionSummary {
    id: string;
    status: JobStatus;
    conversationTurn?: number;
    previewUrl?: string;
    createdFiles: string[];
    changedFiles?: string[];
    createdAt: string;
    completedAt?: string;
}

export interface SandboxLog {
    id: string;
    level: string;
    message: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface CodeArtifact {
    id: string;
    filename: string;
    path: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

export interface ExecutionDetails {
    id: string;
    projectId: string;
    status: JobStatus;
    sandboxId?: string;
    previewUrl?: string;
    generatedCode?: string;
    createdFiles: string[];
    stdout?: string;
    stderr?: string;
    error?: string;
    startedAt?: string;
    completedAt?: string;
    executionTimeMs?: number;
}

export interface GetExecutionStatusResponse {
    success: true;
    execution: ExecutionDetails;
    logs: SandboxLog[];
    artifacts: CodeArtifact[];
}

// Execution logs
export interface GetExecutionLogsResponse {
    success: true;
    logs: SandboxLog[];
    hasMore: boolean;
}

// Project executions list
export interface GetProjectExecutionsResponse {
    success: true;
    executions: ExecutionSummary[];
}

// File content (for editor)
export interface FileContent {
    path: string;
    content: string;
    size: number;
    mimeType?: string;
}

export interface GetProjectFileResponse {
    success: true;
    file: {
        id: string;
        filename: string;
        path: string;
        content: string;
        mimeType: string;
        size: number;
        createdAt: string;
    };
}

// Artifact download
export interface DownloadArtifactResponse {
    success: true;
    content: string;
    filename: string;
    mimeType: string;
}

// Cancel execution
export interface CancelExecutionResponse {
    success: true;
    message: string;
}

// Get all projects
export interface ProjectSummary {
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    lastExecution: {
        id: string;
        status: JobStatus;
        createdAt: string;
    } | null;
}

export interface GetAllProjectsResponse {
    success: true;
    projects: ProjectSummary[];
}

// Error response
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
}
