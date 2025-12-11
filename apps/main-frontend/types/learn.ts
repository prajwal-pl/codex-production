// Learn/Chat Types

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    isLoading?: boolean;
}

export interface ChatContext {
    projectId?: string;
    projectTitle?: string;
    fileContents?: {
        path: string;
        content: string;
    }[];
}

export interface SendChatMessageRequest {
    message: string;
    conversationId?: string;
    context?: ChatContext;
}

export interface SendChatMessageResponse {
    success: boolean;
    message: string;
    data: {
        conversationId: string;
        response: string;
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    };
}

export interface ChatConversation {
    id: string;
    userId: string;
    title: string;
    messages: ChatMessage[];
    context?: ChatContext;
    createdAt: string;
    updatedAt: string;
}

export interface GetChatHistoryResponse {
    success: boolean;
    message: string;
    data: ChatConversation[];
}

export interface SuggestedPrompt {
    title: string;
    description: string;
    prompt: string;
    icon: string;
}
