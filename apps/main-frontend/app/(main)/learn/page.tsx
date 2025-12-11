"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatInput, SuggestedPrompts } from "@/components/global/learn";
import { useSession } from "@/hooks/useSession";
import { sendChatMessage } from "@/lib/api-client";
import { toast } from "sonner";
import { GraduationCap, Sparkles, MessageSquare, Zap } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/learn";

export default function LearnPage() {
    const { user } = useSession();
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Add user message
        const userMessage: ChatMessageType = {
            id: `user_${Date.now()}`,
            role: "user",
            content: content.trim(),
            timestamp: new Date().toISOString(),
        };

        // Add loading assistant message
        const loadingMessage: ChatMessageType = {
            id: `assistant_${Date.now()}`,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString(),
            isLoading: true,
        };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setIsLoading(true);

        try {
            const response = await sendChatMessage({
                message: content.trim(),
                conversationId,
            });

            if (response.success) {
                // Update conversation ID if new
                if (!conversationId) {
                    setConversationId(response.data.conversationId);
                }

                // Replace loading message with actual response
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const loadingIndex = newMessages.findIndex(
                        (m) => m.isLoading
                    );
                    if (loadingIndex !== -1) {
                        newMessages[loadingIndex] = {
                            id: `assistant_${Date.now()}`,
                            role: "assistant",
                            content: response.data.response,
                            timestamp: new Date().toISOString(),
                        };
                    }
                    return newMessages;
                });
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            // Remove loading message on error
            setMessages((prev) => prev.filter((m) => !m.isLoading));

            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to send message";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPrompt = (prompt: string) => {
        handleSendMessage(prompt);
    };

    const handleNewChat = () => {
        setMessages([]);
        setConversationId(undefined);
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-col h-[calc(100vh-var(--header-height)-3rem)]">
            {/* Header */}
            <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 py-4">
                <div className="container max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <GraduationCap className="h-6 w-6 text-primary" />
                                Learn
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Your AI-powered programming assistant
                            </p>
                        </div>
                        {hasMessages && (
                            <button
                                onClick={handleNewChat}
                                className="text-sm text-primary hover:underline"
                            >
                                + New Chat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {!hasMessages ? (
                    /* Welcome Screen */
                    <div className="h-full flex flex-col">
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="max-w-2xl w-full space-y-8">
                                {/* Welcome Message */}
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mx-auto">
                                        <Sparkles className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! How can I help you today?
                                        </h2>
                                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                            I&apos;m Codex AI, your programming assistant. Ask me anything about coding, debugging, best practices, or learning new concepts.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature Highlights */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <MessageSquare className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Natural Chat</p>
                                            <p className="text-xs text-muted-foreground">Ask in plain English</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                            <Zap className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Code Examples</p>
                                            <p className="text-xs text-muted-foreground">With syntax highlighting</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
                                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                            <GraduationCap className="h-5 w-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Learn & Grow</p>
                                            <p className="text-xs text-muted-foreground">Clear explanations</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Suggested Prompts */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-muted-foreground text-center">
                                        Try one of these prompts
                                    </h3>
                                    <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
                                </div>
                            </div>
                        </div>

                        {/* Input at bottom of welcome screen */}
                        <ChatInput
                            onSend={handleSendMessage}
                            isLoading={isLoading}
                            placeholder="Ask me anything about programming..."
                        />
                    </div>
                ) : (
                    /* Chat View */
                    <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-4xl mx-auto pb-4">
                                {messages.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        userName={user?.name || "User"}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <ChatInput
                            onSend={handleSendMessage}
                            isLoading={isLoading}
                            placeholder="Continue the conversation..."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
