import { z } from "zod";

export const CodeExecutionPayloadSchema = z.object({
    projectId: z.string().uuid(),
    userId: z.string().uuid(),
    messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
    })),

    // Conversation context
    conversationTurn: z.number().int().positive().default(1),
    parentExecutionId: z.string().optional(), // Trigger.dev run IDs are not UUIDs
    existingFiles: z.array(z.string()).default([]), // Files that already exist in sandbox

    sandboxConfig: z.object({
        template: z.enum(["NODE_22", "PYTHON_311", "NEXT_15", "REACT_19"]),
        timeout: z.number().max(3600000).default(300000), // Max 1 hour, default 5 min
        keepAlive: z.boolean().default(true), // Keep sandbox running for preview
        reuseSandbox: z.boolean().default(false), // Reuse existing sandbox for conversation
        sandboxId: z.string().optional(), // Existing sandbox ID to reconnect to
    }).optional(),
});

export type CodeExecutionPayload = z.infer<typeof CodeExecutionPayloadSchema>;

// Conversation context for system prompt
export interface ConversationContext {
    existingFiles: string[];
    conversationTurn: number;
    previousError?: string;
    lastChanges?: {
        created: string[];
        updated: string[];
        deleted: string[];
    };
}

// File change tracking
export interface FileChange {
    path: string;
    action: "create" | "update" | "delete";
    size?: number;
}
