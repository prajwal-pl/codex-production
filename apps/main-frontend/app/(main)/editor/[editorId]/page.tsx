"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EditorLayout } from "@/components/global/editor/editor-layout";
import { LoadingState } from "@/components/global/editor/loading-state";
import { Message } from "@/types";
import { JobStatus } from "@/types/api";
import {
  getConversation,
  continueConversation,
  getExecutionStatus,
  downloadArtifact,
} from "@/lib/api-client";

type EditorPageProps = {
  params: Promise<{ editorId: string }>;
};

const EditorPage = ({ params }: EditorPageProps) => {
  const router = useRouter();
  const p = React.use(params);
  const projectId = p.editorId;

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [projectTitle, setProjectTitle] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);
  const [currentExecutionStatus, setCurrentExecutionStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial conversation data
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getConversation(projectId);

        const { project, conversation, executions } = response.data;

        // Set project metadata
        setProjectTitle(project.title);
        setPreviewUrl(project.previewUrl || undefined);

        // Convert conversation prompts to Message format
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
        setMessages(convertedMessages);

        // Get files from the most recent completed execution
        const lastCompletedExecution = executions
          .filter((ex) => ex.status === "COMPLETED")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        if (lastCompletedExecution) {
          setFiles(lastCompletedExecution.createdFiles);
          if (lastCompletedExecution.previewUrl) {
            setPreviewUrl(lastCompletedExecution.previewUrl);
          }
        }

        // Check if there's an active execution
        const activeExecution = executions.find((ex) =>
          ["PENDING", "RUNNING", "STREAMING", "EXECUTING"].includes(ex.status)
        );

        if (activeExecution) {
          setCurrentExecutionId(activeExecution.id);
          setIsGenerating(true);
          pollExecutionStatus(activeExecution.id);
        }

      } catch (err) {
        console.error("Failed to load conversation:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load project. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [projectId]);

  // Poll execution status
  const pollExecutionStatus = async (executionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await getExecutionStatus(executionId);
        const { execution } = statusResponse;

        // Update current execution status
        setCurrentExecutionStatus(execution.status);

        // Update files and preview URL if available
        if (execution.createdFiles.length > 0) {
          setFiles(execution.createdFiles);
        }
        if (execution.previewUrl) {
          setPreviewUrl(execution.previewUrl);
        }

        // Check if execution is complete
        if (["COMPLETED", "FAILED", "CANCELLED"].includes(execution.status)) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setCurrentExecutionId(null);
          setCurrentExecutionStatus(null);

          // Add assistant response to messages if completed
          if (execution.status === "COMPLETED" && execution.generatedCode) {
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
            setMessages((prev) => [...prev, assistantMessage]);
          } else if (execution.status === "FAILED") {
            setError(execution.error || "Code generation failed");
          }
        }
      } catch (err) {
        console.error("Failed to poll execution status:", err);
        clearInterval(pollInterval);
        setIsGenerating(false);
        setCurrentExecutionStatus(null);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  };

  // Handle sending new messages
  const handleSendMessage = async (message: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await continueConversation(projectId, { message });
      const { executionId } = response.data;

      setCurrentExecutionId(executionId);
      pollExecutionStatus(executionId);

    } catch (err) {
      console.error("Failed to send message:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process your message. Please try again."
      );
      setIsGenerating(false);
    }
  };

  // Handle file selection - download artifact content
  const handleFileSelect = async (filePath: string): Promise<string | undefined> => {
    try {
      // Find the artifact for this file path
      // For now, we'll need to fetch from execution artifacts
      // This is a simplified version - you may want to cache artifacts
      if (currentExecutionId) {
        const statusResponse = await getExecutionStatus(currentExecutionId);
        const artifact = statusResponse.artifacts.find((a) => a.path === filePath);

        if (artifact) {
          const blob = await downloadArtifact(artifact.id);
          return await blob.text();
        }
      }

      // Fallback: return placeholder
      return `// ${filePath}\n// Loading file content...`;
    } catch (err) {
      console.error("Failed to load file:", err);
      return `// ${filePath}\n// Failed to load file content`;
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        status="INITIALIZING"
        message="Loading your project..."
        showSteps={false}
      />
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-lg font-semibold">Failed to Load Project</h2>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/editor")}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Create New Project
          </button>
        </div>
      </div>
    );
  }

  // Show loading overlay during generation
  const loadingOverlay = isGenerating && currentExecutionStatus && (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <LoadingState
        status={currentExecutionStatus}
        message={
          currentExecutionStatus === "PENDING"
            ? "Queuing your request..."
            : currentExecutionStatus === "RUNNING"
              ? "Generating code..."
              : currentExecutionStatus === "STREAMING"
                ? "Streaming response..."
                : currentExecutionStatus === "EXECUTING"
                  ? "Setting up your project..."
                  : "Processing..."
        }
        showSteps={["RUNNING", "EXECUTING"].includes(currentExecutionStatus)}
      />
    </div>
  );

  return (
    <>
      {loadingOverlay}
      <EditorLayout
        messages={messages}
        files={files}
        previewUrl={previewUrl}
        isLoading={isGenerating}
        onSendMessage={handleSendMessage}
        onFileSelect={handleFileSelect}
        projectTitle={projectTitle}
      />
    </>
  );
};

export default EditorPage;


