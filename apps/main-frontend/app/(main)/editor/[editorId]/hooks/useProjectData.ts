import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types";
import { JobStatus } from "@/types/api";
import { getConversation, getExecutionStatus } from "@/lib/api-client";
import { toast } from "sonner";

interface ProjectData {
    messages: Message[];
    files: string[];
    previewUrl?: string;
    projectTitle: string;
}

interface UseProjectDataResult {
    data: ProjectData | null;
    isLoading: boolean;
    error: string | null;
    currentExecutionId: string | null;
    currentExecutionStatus: JobStatus | null;
}

export function useProjectData(projectId: string): UseProjectDataResult {
    const [data, setData] = useState<ProjectData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
    const [currentExecutionStatus, setCurrentExecutionStatus] = useState<JobStatus | null>(null);

    useEffect(() => {
        let mounted = true;
        let pollInterval: NodeJS.Timeout | null = null;

        const updateExecutionStatus = async (executionId: string) => {
            try {
                const { execution } = await getExecutionStatus(executionId);
                if (!mounted) return true;

                setCurrentExecutionStatus(execution.status);

                // Update files and preview as they become available
                if (execution.createdFiles.length > 0) {
                    setData(prev => prev ? { ...prev, files: execution.createdFiles } : null);
                }
                if (execution.previewUrl) {
                    setData(prev => prev ? { ...prev, previewUrl: execution.previewUrl } : null);
                }

                // Check if complete
                if (["COMPLETED", "FAILED", "CANCELLED"].includes(execution.status)) {
                    setIsLoading(false);
                    setCurrentExecutionId(null);
                    setCurrentExecutionStatus(null);

                    if (execution.status === "COMPLETED") {
                        toast.success("Code generated successfully!", {
                            id: `execution-${executionId}`,
                            description: `${execution.createdFiles.length} files ready`,
                        });

                        // Add assistant message if available
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
                            setData(prev => prev ? { ...prev, messages: [...prev.messages, assistantMessage] } : null);
                        }
                    } else if (execution.status === "FAILED") {
                        const errorMsg = execution.error || "Code generation failed";
                        setError(errorMsg);
                        toast.error("Generation failed", {
                            id: `execution-${executionId}`,
                            description: errorMsg,
                        });
                    }

                    return true; // Execution complete
                }

                return false; // Execution ongoing
            } catch (err) {
                console.error("Failed to poll execution:", err);
                if (!mounted) return true;

                setIsLoading(false);
                setCurrentExecutionStatus(null);
                toast.error("Lost connection", { id: `execution-${executionId}` });
                return true; // Stop polling on error
            }
        };

        const loadProject = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getConversation(projectId);
                if (!mounted) return;

                const { project, conversation, executions } = response.data;

                // Convert conversation to messages
                const convertedMessages: Message[] = conversation.map((prompt) => ({
                    id: prompt.id,
                    role: prompt.role === "USER" ? "user" : "assistant",
                    content: prompt.content,
                    createdAt: prompt.createdAt,
                    metadata: {
                        filesChanged: prompt.execution?.changedFiles,
                        executionId: prompt.execution?.id,
                    },
                }));

                // Get files from last completed execution
                const completedExecution = executions
                    .filter((ex) => ex.status === "COMPLETED")
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                const projectData: ProjectData = {
                    messages: convertedMessages,
                    files: completedExecution?.createdFiles || [],
                    previewUrl: completedExecution?.previewUrl || project.previewUrl || undefined,
                    projectTitle: project.title,
                };

                setData(projectData);

                // Check for active execution
                const activeExecution = executions.find((ex) =>
                    ["PENDING", "RUNNING", "STREAMING", "EXECUTING"].includes(ex.status)
                );

                if (activeExecution) {
                    setCurrentExecutionId(activeExecution.id);
                    setCurrentExecutionStatus(activeExecution.status);
                    toast.loading("Generating your project...", {
                        id: `execution-${activeExecution.id}`,
                    });

                    // Start polling
                    pollInterval = setInterval(async () => {
                        const isComplete = await updateExecutionStatus(activeExecution.id);
                        if (isComplete && pollInterval) {
                            clearInterval(pollInterval);
                        }
                    }, 2000);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed to load project:", err);
                if (!mounted) return;

                const errorMessage = err instanceof Error ? err.message : "Failed to load project";
                setError(errorMessage);
                setIsLoading(false);
                toast.error("Failed to load project", { description: errorMessage });
            }
        };

        loadProject();

        return () => {
            mounted = false;
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [projectId]);

    return {
        data,
        isLoading,
        error,
        currentExecutionId,
        currentExecutionStatus,
    };
}
