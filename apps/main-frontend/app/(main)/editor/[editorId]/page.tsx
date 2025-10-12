"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EditorLayout } from "@/components/global/editor/editor-layout";
import { LoadingState } from "@/components/global/editor/loading-state";
import { Message } from "@/types";
import { getProjectFile } from "@/lib/api-client";
import { useProjectData } from "./hooks/useProjectData";
import { useConversation } from "./hooks/useConversation";

export const dynamic = 'force-dynamic';

type EditorPageProps = {
  params: Promise<{ editorId: string }>;
};

const EditorPage = ({ params }: EditorPageProps) => {
  const router = useRouter();
  const p = React.use(params);
  const projectId = p.editorId;

  // Track if we need to refresh
  const [shouldRefresh, setShouldRefresh] = React.useState(false);

  // Check if refresh is needed on mount
  React.useEffect(() => {
    const hasRefreshed = sessionStorage.getItem(`refreshed-${projectId}`);
    if (!hasRefreshed) {
      setShouldRefresh(true);
      sessionStorage.setItem(`refreshed-${projectId}`, 'true');
      // Small delay to ensure loading state renders first
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, [projectId]);

  // Use custom hooks for data management
  const { data, isLoading, error, currentExecutionStatus } = useProjectData(projectId);
  const { sendMessage, isGenerating } = useConversation(projectId);

  // Local state for messages and files (to allow optimistic updates)
  const [localMessages, setLocalMessages] = React.useState<Message[]>([]);
  const [localFiles, setLocalFiles] = React.useState<string[]>([]);
  const [localPreviewUrl, setLocalPreviewUrl] = React.useState<string | undefined>();
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Show loading state immediately if refresh is pending
  if (shouldRefresh) {
    return <LoadingState status="INITIALIZING" message="Loading your project..." showSteps={false} />;
  }

  // Sync data from hook to local state
  React.useEffect(() => {
    if (data) {
      setLocalMessages(data.messages);
      setLocalFiles(data.files);
      setLocalPreviewUrl(data.previewUrl);
      setHasInitialized(true);
    }
  }, [data]);

  // Handle sending messages with optimistic updates
  const handleSendMessage = async (message: string) => {
    // Optimistic update - add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMessage]);

    // Send message and handle updates
    await sendMessage(message, (files, previewUrl, reloadMessages) => {
      if (files.length > 0) setLocalFiles(files);
      if (previewUrl) setLocalPreviewUrl(previewUrl);

      // ✅ If reloadMessages is true, sync from data (which was reloaded in the hook)
      if (reloadMessages && data) {
        setLocalMessages(data.messages);
      }
    });
  };

  // Handle file selection
  const handleFileSelect = async (filePath: string): Promise<string | undefined> => {
    try {
      const response = await getProjectFile(projectId, filePath);
      return response.file.content;
    } catch (err: any) {
      console.error("Failed to load file:", err);
      if (err?.response?.status === 404) {
        return `// ${filePath}\n// File not found`;
      }
      return `// ${filePath}\n// Failed to load file`;
    }
  };

  // Show loading state during initial load or when execution is running with no files
  // MANDATORY: Must show loading if not initialized yet OR if loading OR if execution running with no files
  if (!hasInitialized || isLoading || (currentExecutionStatus && localFiles.length === 0)) {
    return (
      <LoadingState
        status={currentExecutionStatus || "INITIALIZING"}
        message={
          currentExecutionStatus === "RUNNING"
            ? "Generating code with AI..."
            : currentExecutionStatus === "EXECUTING"
              ? "Setting up your project..."
              : "Loading your project..."
        }
        showSteps={!!currentExecutionStatus}
      />
    );
  }

  // Show error state
  if (error && !data) {
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

  // Show loading overlay during generation (after initial load)
  const showLoadingOverlay = isGenerating && currentExecutionStatus;

  return (
    <>
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <LoadingState
            status={currentExecutionStatus!}
            message={
              currentExecutionStatus === "PENDING"
                ? "Queuing your request..."
                : currentExecutionStatus === "RUNNING"
                  ? "Generating code..."
                  : currentExecutionStatus === "EXECUTING"
                    ? "Setting up your project..."
                    : "Processing..."
            }
            showSteps={["RUNNING", "EXECUTING"].includes(currentExecutionStatus!)}
          />
        </div>
      )}
      <EditorLayout
        messages={localMessages}
        files={localFiles}
        previewUrl={localPreviewUrl}
        isLoading={isGenerating}
        onSendMessage={handleSendMessage}
        onFileSelect={handleFileSelect}
        projectTitle={data?.projectTitle || "Loading..."}
      />
    </>
  );
};

export default EditorPage;
