"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "@/types";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { FileExplorer } from "./file-explorer";
import { ContentTabs } from "./content-tabs";
import { PanelLeftClose, PanelLeftOpen, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

interface EditorLayoutProps {
    messages: Message[];
    files: string[];
    previewUrl?: string;
    isLoading?: boolean;
    error?: string;
    onSendMessage: (message: string) => Promise<void>;
    projectTitle?: string;
    onFileSelect?: (filePath: string) => Promise<string | undefined>;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
    messages,
    files,
    previewUrl,
    isLoading,
    error,
    onSendMessage,
    projectTitle,
    onFileSelect,
}) => {
    const [showSidebar, setShowSidebar] = useState(true);
    const [selectedFile, setSelectedFile] = useState<string>();
    const [fileContent, setFileContent] = useState<string>();
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle file selection
    const handleFileSelect = async (filePath: string) => {
        setSelectedFile(filePath);
        setIsLoadingFile(true);

        try {
            if (onFileSelect) {
                const content = await onFileSelect(filePath);
                setFileContent(content);
            } else {
                // Mock content for UI-only mode
                setFileContent(`// ${filePath}\n// File content would be loaded here`);
            }
        } catch (error) {
            console.error("Failed to load file content:", error);
            setFileContent(`// Error loading file: ${filePath}`);
        } finally {
            setIsLoadingFile(false);
        }
    };

    return (
        <div className="flex h-full w-full overflow-hidden bg-background">
            <ResizablePanelGroup direction="horizontal">
                {/* Sidebar - File Explorer */}
                {showSidebar && (
                    <>
                        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                            <div className="flex h-full flex-col border-r bg-card">
                                {/* Sidebar Header */}
                                <div className="flex items-center justify-between border-b px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Code2 className="size-4 text-primary" />
                                        <span className="text-sm font-semibold">Files</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                        onClick={() => setShowSidebar(false)}
                                    >
                                        <PanelLeftClose className="size-4" />
                                    </Button>
                                </div>

                                {/* File Explorer */}
                                <div className="flex-1 overflow-hidden">
                                    <FileExplorer
                                        files={files}
                                        selectedFile={selectedFile}
                                        onFileSelect={handleFileSelect}
                                    />
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                    </>
                )}

                {/* Main Content - Preview */}
                <ResizablePanel defaultSize={showSidebar ? 50 : 70}>
                    <ContentTabs
                        previewUrl={previewUrl}
                        isLoading={isLoading}
                        error={error}
                        selectedFile={selectedFile}
                        fileContent={fileContent}
                        isLoadingFile={isLoadingFile}
                    />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Panel - Chat */}
                <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                    <div className="flex h-full flex-col border-l bg-card">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div>
                                <h2 className="text-sm font-semibold">Chat</h2>
                                {projectTitle && (
                                    <p className="text-xs text-muted-foreground">{projectTitle}</p>
                                )}
                            </div>

                            {!showSidebar && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => setShowSidebar(true)}
                                >
                                    <PanelLeftOpen className="size-4" />
                                </Button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center p-8">
                                    <div className="text-center">
                                        <h3 className="font-semibold">Start a conversation</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Ask Codex to modify your project
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {messages.map((message, index) => (
                                        <ChatMessage
                                            key={message.id}
                                            message={message}
                                            isLatest={index === messages.length - 1}
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <ChatInput onSend={onSendMessage} disabled={isLoading} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};

