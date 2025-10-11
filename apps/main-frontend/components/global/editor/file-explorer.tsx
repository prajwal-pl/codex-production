"use client";

import React, { useState } from "react";
import { FileItem } from "@/types";
import { cn } from "@/lib/utils";
import {
    File,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
} from "lucide-react";

interface FileExplorerProps {
    files: string[];
    onFileSelect?: (filePath: string) => void;
    selectedFile?: string;
}

// Helper function to build a tree structure from flat file paths
function buildFileTree(paths: string[]): FileItem[] {
    const root: FileItem[] = [];

    paths.forEach((path) => {
        const parts = path.split("/").filter(Boolean);
        let currentLevel = root;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const existingItem = currentLevel.find((item) => item.path === part);

            if (existingItem) {
                if (!isFile && existingItem.children) {
                    currentLevel = existingItem.children;
                }
            } else {
                const newItem: FileItem = {
                    path: part,
                    type: isFile ? "file" : "directory",
                    ...(isFile ? {} : { children: [] }),
                };

                currentLevel.push(newItem);

                if (!isFile && newItem.children) {
                    currentLevel = newItem.children;
                }
            }
        });
    });

    return root;
}

interface FileTreeItemProps {
    item: FileItem;
    fullPath: string;
    level: number;
    selectedFile?: string;
    onFileSelect?: (filePath: string) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
    item,
    fullPath,
    level,
    selectedFile,
    onFileSelect,
}) => {
    const [isExpanded, setIsExpanded] = useState(level === 0);
    const isDirectory = item.type === "directory";
    const isSelected = selectedFile === fullPath;

    const handleClick = () => {
        if (isDirectory) {
            setIsExpanded(!isExpanded);
        } else {
            onFileSelect?.(fullPath);
        }
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={cn(
                    "flex w-full items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                    isSelected && "bg-accent/50",
                    "text-left"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                {isDirectory && (
                    <span className="shrink-0">
                        {isExpanded ? (
                            <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                    </span>
                )}

                {isDirectory ? (
                    isExpanded ? (
                        <FolderOpen className="size-4 shrink-0 text-primary" />
                    ) : (
                        <Folder className="size-4 shrink-0 text-primary" />
                    )
                ) : (
                    <File className="size-4 shrink-0 text-muted-foreground" />
                )}

                <span className="truncate">{item.path}</span>
            </button>

            {isDirectory && isExpanded && item.children && (
                <div>
                    {item.children.map((child) => (
                        <FileTreeItem
                            key={child.path}
                            item={child}
                            fullPath={`${fullPath}/${child.path}`}
                            level={level + 1}
                            selectedFile={selectedFile}
                            onFileSelect={onFileSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
    files,
    onFileSelect,
    selectedFile,
}) => {
    const fileTree = React.useMemo(() => buildFileTree(files), [files]);

    if (files.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-4">
                <p className="text-sm text-muted-foreground">No files yet</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto border-l">
            <div className="space-y-0.5 p-2">
                {fileTree.map((item) => (
                    <FileTreeItem
                        key={item.path}
                        item={item}
                        fullPath={item.path}
                        level={0}
                        selectedFile={selectedFile}
                        onFileSelect={onFileSelect}
                    />
                ))}
            </div>
        </div>
    );
};
