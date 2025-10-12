import { useState, useCallback } from "react";
import { Message } from "@/types";
import { continueConversation, getExecutionStatus } from "@/lib/api-client";
import { toast } from "sonner";

interface UseConversationResult {
    sendMessage: (message: string, onUpdate: (files: string[], previewUrl?: string, message?: Message) => void) => Promise<void>;
    isGenerating: boolean;
}

export function useConversation(projectId: string): UseConversationResult {
    const [isGenerating, setIsGenerating] = useState(false);

    const sendMessage = useCallback(async (
        message: string,
        onUpdate: (files: string[], previewUrl?: string, message?: Message) => void
    ) => {
        if (isGenerating) return;

        setIsGenerating(true);

        try {
            const response = await continueConversation(projectId, { message });
            const { executionId } = response.data;

            toast.loading("Processing your request...", {
                id: `execution-${executionId}`,
            });

            // Poll for execution status
            const pollInterval = setInterval(async () => {
                try {
                    const { execution } = await getExecutionStatus(executionId);

                    // Update toast based on status
                    if (execution.status === "RUNNING") {
                        toast.loading("Generating code with AI...", {
                            id: `execution-${executionId}`,
                        });
                    } else if (execution.status === "EXECUTING") {
                        toast.loading("Setting up sandbox...", {
                            id: `execution-${executionId}`,
                        });
                    }

                    // Update files and preview
                    if (execution.createdFiles.length > 0 || execution.previewUrl) {
                        onUpdate(execution.createdFiles, execution.previewUrl);
                    }

                    // Check if complete
                    if (["COMPLETED", "FAILED", "CANCELLED"].includes(execution.status)) {
                        clearInterval(pollInterval);
                        setIsGenerating(false);

                        if (execution.status === "COMPLETED") {
                            toast.success("Code generated!", {
                                id: `execution-${executionId}`,
                                description: `${execution.createdFiles.length} files ready`,
                            });

                            // Create assistant message
                            if (execution.generatedCode) {
                                const assistantMessage: Message = {
                                    id: `msg-${Date.now()}-assistant`,
                                    role: "assistant",
                                    content: execution.generatedCode,
                                    createdAt: execution.completedAt || new Date().toISOString(),
                                    metadata: {
                                        filesChanged: execution.createdFiles,
                                        executionId: execution.id,
                                    },
                                };
                                onUpdate(execution.createdFiles, execution.previewUrl, assistantMessage);
                            }
                        } else if (execution.status === "FAILED") {
                            toast.error("Generation failed", {
                                id: `execution-${executionId}`,
                                description: execution.error || "Unknown error",
                            });
                        }
                    }
                } catch (err) {
                    console.error("Poll error:", err);
                    clearInterval(pollInterval);
                    setIsGenerating(false);
                    toast.error("Lost connection", { id: `execution-${executionId}` });
                }
            }, 2000);

        } catch (err) {
            console.error("Failed to send message:", err);
            setIsGenerating(false);
            const errorMessage = err instanceof Error ? err.message : "Failed to send message";
            toast.error("Failed to send message", { description: errorMessage });
        }
    }, [projectId, isGenerating]);

    return { sendMessage, isGenerating };
}
