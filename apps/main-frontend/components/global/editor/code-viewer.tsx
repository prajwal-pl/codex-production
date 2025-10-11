"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { File, Loader2 } from "lucide-react";

interface CodeViewerProps {
    selectedFile?: string;
    fileContent?: string;
    isLoading?: boolean;
}

// Helper to get language from file extension
const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        json: "json",
        html: "html",
        css: "css",
        scss: "scss",
        md: "markdown",
        py: "python",
        sh: "shell",
        yml: "yaml",
        yaml: "yaml",
    };
    return languageMap[ext || ""] || "plaintext";
};

// Helper to parse file path into breadcrumb segments
const parseBreadcrumbs = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    return segments;
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
    selectedFile,
    fileContent,
    isLoading,
}) => {
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        if (fileContent !== undefined) {
            setContent(fileContent);
        }
    }, [fileContent]);

    if (!selectedFile) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <File className="mx-auto size-12 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No file selected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Select a file from the file explorer to view its contents
                    </p>
                </div>
            </div>
        );
    }

    const breadcrumbs = parseBreadcrumbs(selectedFile);
    const language = getLanguageFromPath(selectedFile);

    return (
        <div className="flex h-full flex-col">
            {/* Breadcrumb Header */}
            <div className="border-b bg-muted/30 px-4 py-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((segment, index) => (
                            <React.Fragment key={index}>
                                {index === breadcrumbs.length - 1 ? (
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="flex items-center gap-1.5">
                                            <File className="size-3.5" />
                                            {segment}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                ) : (
                                    <>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink className="text-muted-foreground">
                                                {segment}
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Editor
                        height="100%"
                        language={language}
                        value={content}
                        theme="vs-dark"
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            wordWrap: "on",
                            padding: { top: 16, bottom: 16 },
                        }}
                    />
                )}
            </div>
        </div>
    );
};
