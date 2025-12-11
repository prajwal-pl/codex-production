import { type Request, type Response } from "express";
import { generateWithGitHubModels, type GitHubModelsMessage } from "../lib/github-models-provider.js";

// In-memory store for conversations (in production, use Redis or database)
const conversationStore = new Map<string, GitHubModelsMessage[]>();

const LEARN_SYSTEM_PROMPT = `You are Codex AI, a helpful and knowledgeable programming assistant. Your goal is to help users learn programming concepts, debug code, understand best practices, and improve their coding skills.

Key traits:
- Be encouraging and supportive, especially for beginners
- Provide clear, well-structured explanations
- Use code examples when helpful (use markdown code blocks with language highlighting)
- Break down complex concepts into digestible parts
- Suggest best practices and modern approaches
- When debugging, explain what went wrong and why
- Adapt your explanation complexity to the user's apparent skill level

When users share project context or code:
- Analyze it thoroughly before responding
- Reference specific parts of their code when relevant
- Suggest improvements while being constructive
- Explain the "why" behind your suggestions

Format your responses using Markdown:
- Use \`inline code\` for short code snippets
- Use code blocks with language tags for longer code
- Use headers (##, ###) to organize longer responses
- Use bullet points for lists
- Use **bold** for emphasis

Always aim to teach, not just give answers. Help users understand the underlying concepts.`;

interface ChatRequestBody {
    message: string;
    conversationId?: string;
    context?: {
        projectId?: string;
        projectTitle?: string;
        fileContents?: {
            path: string;
            content: string;
        }[];
    };
}

export const chatHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { message, conversationId, context } = req.body as ChatRequestBody;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        // Generate or use existing conversation ID
        const convId = conversationId || `conv_${userId}_${Date.now()}`;

        // Get or initialize conversation history
        let conversationHistory = conversationStore.get(convId) || [];

        // If new conversation, add system prompt
        if (conversationHistory.length === 0) {
            conversationHistory.push({
                role: "system",
                content: LEARN_SYSTEM_PROMPT,
            });

            // Add context if provided
            if (context?.fileContents && context.fileContents.length > 0) {
                const contextContent = context.fileContents
                    .map(f => `### File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
                    .join("\n\n");

                conversationHistory.push({
                    role: "system",
                    content: `The user is working on a project${context.projectTitle ? ` called "${context.projectTitle}"` : ""}. Here are the relevant files:\n\n${contextContent}\n\nUse this context to provide more specific and helpful answers.`,
                });
            }
        }

        // Add user message
        conversationHistory.push({
            role: "user",
            content: message.trim(),
        });

        // Trim conversation history if it gets too long (keep last 20 messages + system)
        const systemMessages = conversationHistory.filter(m => m.role === "system");
        const nonSystemMessages = conversationHistory.filter(m => m.role !== "system");
        if (nonSystemMessages.length > 20) {
            conversationHistory = [
                ...systemMessages,
                ...nonSystemMessages.slice(-20),
            ];
        }

        // Generate response using GitHub Models
        const result = await generateWithGitHubModels(conversationHistory, {
            temperature: 0.7,
            maxTokens: 4096,
            model: "gpt-4.1",
        });

        // Add assistant response to history
        conversationHistory.push({
            role: "assistant",
            content: result.content,
        });

        // Store updated conversation
        conversationStore.set(convId, conversationHistory);

        // Clean up old conversations (older than 24 hours)
        // In production, use a proper TTL mechanism
        setTimeout(() => {
            if (conversationStore.has(convId)) {
                const firstMsgTime = parseInt(convId.split("_")[2] || "0");
                if (Date.now() - firstMsgTime > 24 * 60 * 60 * 1000) {
                    conversationStore.delete(convId);
                }
            }
        }, 60000);

        return res.json({
            success: true,
            message: "Response generated successfully",
            data: {
                conversationId: convId,
                response: result.content,
                usage: {
                    promptTokens: result.promptTokens,
                    completionTokens: result.completionTokens,
                    totalTokens: result.totalTokens,
                },
            },
        });
    } catch (error) {
        console.error("Chat error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Handle specific error types
        if (errorMessage.includes("GITHUB_TOKEN")) {
            return res.status(503).json({
                success: false,
                message: "AI service is not configured. Please try again later.",
            });
        }

        if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please wait a moment and try again.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to generate response. Please try again.",
            error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        });
    }
};

export const getChatHistoryHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Get all conversations for this user from memory
        const userConversations: Array<{
            id: string;
            title: string;
            messageCount: number;
            lastMessage: string;
            createdAt: string;
        }> = [];

        conversationStore.forEach((messages, convId) => {
            if (convId.includes(userId)) {
                const nonSystemMessages = messages.filter(m => m.role !== "system");
                if (nonSystemMessages.length > 0) {
                    const firstUserMsg = nonSystemMessages.find(m => m.role === "user");
                    const lastMsg = nonSystemMessages[nonSystemMessages.length - 1];

                    userConversations.push({
                        id: convId,
                        title: firstUserMsg?.content.slice(0, 50) + (firstUserMsg && firstUserMsg.content.length > 50 ? "..." : "") || "New Conversation",
                        messageCount: nonSystemMessages.length,
                        lastMessage: lastMsg?.content.slice(0, 100) + (lastMsg && lastMsg.content.length > 100 ? "..." : "") || "",
                        createdAt: new Date(parseInt(convId.split("_")[2] || Date.now().toString())).toISOString(),
                    });
                }
            }
        });

        // Sort by creation date (newest first)
        userConversations.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return res.json({
            success: true,
            message: "Chat history retrieved successfully",
            data: userConversations,
        });
    } catch (error) {
        console.error("Get chat history error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve chat history",
        });
    }
};
