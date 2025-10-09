import { z } from "zod";

export const CodeExecutionPayloadSchema = z.object({
    projectId: z.string().uuid(),
    userId: z.string().uuid(),
    messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
    })),
    sandboxConfig: z.object({
        template: z.enum(["NODE_22", "PYTHON_311", "NEXT_15", "REACT_19"]),
        timeout: z.number().max(900000).default(300000), // 5 min default for web apps
        keepAlive: z.boolean().default(true), // Keep sandbox running for preview
    }).optional(),
});

export type CodeExecutionPayload = z.infer<typeof CodeExecutionPayloadSchema>;