import { useState, useCallback } from "react";
import { Message } from "@/types";
import { continueConversation, getExecutionStatus, getConversation } from "@/lib/api-client";
import { toast } from "sonner";

interface UseConversationResult {
    sendMessage: (message: string, onUpdate: (files: string[], previewUrl?: string, reloadMessages?: boolean) => void) => Promise<void>;
    isGenerating: boolean;
}

export function useConversation(projectId: string): UseConversationResult {
    const [isGenerating, setIsGenerating] = useState(false);

    const sendMessage = useCallback(async (
        message: string,
        onUpdate: (files: string[], previewUrl?: string, reloadMessages?: boolean) => void
    ) => {
        if (isGenerating) return;

        setIsGenerating(true);

        try {
            const response = await continueConversation(projectId, { message });
            const { executionId } = response.data;

            console.log("✅ Conversation started:", { executionId, projectId });

            toast.loading("Processing your request...", {
                id: `execution-${executionId}`,
            });

            let retryCount = 0;
            const maxRetries = 5;

            // Poll for execution status with retry logic
            const pollInterval = setInterval(async () => {
                try {
                    const { execution } = await getExecutionStatus(executionId);

                    // Reset retry count on success
                    retryCount = 0;

                    // Update toast based on status
                    if (execution.status === "RUNNING" || execution.status === "STREAMING") {
                        toast.loading("Generating code with AI...", {
                            id: `execution-${executionId}`,
                        });
                    } else if (execution.status === "EXECUTING") {
                        toast.loading("Setting up sandbox...", {
                            id: `execution-${executionId}`,
                        });
                    } else if (execution.status === "PENDING") {
                        toast.loading("Initializing...", {
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

                            // ✅ Signal to reload conversation messages
                            onUpdate(execution.createdFiles, execution.previewUrl, true);
                        } else if (execution.status === "FAILED") {
                            toast.error("Generation failed", {
                                id: `execution-${executionId}`,
                                description: execution.error || "Unknown error",
                            });
                        }
                    }
                } catch (err: any) {
                    // Handle 404 errors with retry logic (execution record might not be created yet)
                    if (err?.response?.status === 404 && retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Execution not found yet, retrying... (${retryCount}/${maxRetries})`);
                        return; // Continue polling
                    }

                    console.error("Poll error:", err);
                    clearInterval(pollInterval);
                    setIsGenerating(false);

                    const errorMessage = err?.response?.status === 404
                        ? "Execution not found. Please try again."
                        : "Lost connection to server";

                    toast.error(errorMessage, { id: `execution-${executionId}` });
                }
            }, 2000);

        } catch (err: any) {
            console.error("Failed to send message:", err);
            setIsGenerating(false);

            // Handle specific error cases
            if (err?.response?.status === 409) {
                // Another execution is in progress
                const existingExecutionId = err?.response?.data?.executionId;
                toast.error("Please wait", {
                    description: "Another generation is already in progress",
                    id: existingExecutionId ? `execution-${existingExecutionId}` : undefined,
                });
            } else {
                const errorMessage = err?.response?.data?.message || err?.message || "Failed to send message";
                toast.error("Failed to send message", { description: errorMessage });
            }
        }
    }, [projectId, isGenerating]);

    return { sendMessage, isGenerating };
}
