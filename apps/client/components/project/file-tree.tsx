"use client";

import React, { useState } from "react";
import {
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  PlusCircle,
  FilePlus,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { cn } from "components/lib/utils";

// Types for file structure
type FileSystemItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileSystemItem[];
  extension?: string;
};

interface FileTreeProps {
  onFileSelect?: (file: FileSystemItem) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ onFileSelect }) => {
  // Example project structure - in a real app, this would come from an API or context
  const [files, setFiles] = useState<FileSystemItem[]>([
    {
      id: "1",
      name: "src",
      type: "folder",
      children: [
        {
          id: "2",
          name: "components",
          type: "folder",
          children: [
            { id: "3", name: "Button.tsx", type: "file", extension: "tsx" },
            { id: "4", name: "Card.tsx", type: "file", extension: "tsx" },
          ],
        },
        { id: "5", name: "App.tsx", type: "file", extension: "tsx" },
        { id: "6", name: "index.tsx", type: "file", extension: "tsx" },
      ],
    },
    {
      id: "7",
      name: "public",
      type: "folder",
      children: [
        { id: "8", name: "favicon.ico", type: "file", extension: "ico" },
        { id: "9", name: "index.html", type: "file", extension: "html" },
      ],
    },
    { id: "10", name: "package.json", type: "file", extension: "json" },
    { id: "11", name: "tsconfig.json", type: "file", extension: "json" },
    { id: "12", name: "README.md", type: "file", extension: "md" },
  ]);

  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    "1": true, // Expand src by default
  });

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    itemId: string;
  } | null>(null);

  // Toggle folder expanded state
  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle file selection
  const handleFileClick = (file: FileSystemItem) => {
    if (file.type === "file") {
      setSelectedFile(file.id);
      onFileSelect?.(file);
    }
  };

  // Show context menu
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      itemId: id,
    });
  };

  // Hide context menu when clicking elsewhere
  const handleClickOutside = () => {
    setContextMenu(null);
  };

  // Recursive component for rendering files and folders
  const renderItem = (item: FileSystemItem, depth = 0) => {
    const isFolder = item.type === "folder";
    const isExpanded = expandedFolders[item.id];
    const isSelected = selectedFile === item.id;

    return (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-sm cursor-pointer hover:bg-zinc-900 text-sm",
            isSelected && "bg-zinc-900 text-zinc-100"
          )}
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(item.id);
            } else {
              handleFileClick(item);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item.id)}
        >
          {isFolder ? (
            <>
              <span className="mr-1 text-zinc-400">
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
              <Folder size={16} className="mr-2 text-zinc-400" />
            </>
          ) : (
            <>
              <span className="mr-1 w-4" />
              <FileIcon fileName={item.name} className="mr-2" />
            </>
          )}
          <span className="truncate">{item.name}</span>
        </div>

        {isFolder && isExpanded && item.children && (
          <div className="pl-4">
            {item.children.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col bg-black text-zinc-300 overflow-auto"
      onClick={handleClickOutside}
    >
      {/* Header with actions */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <h3 className="font-medium text-sm">Files</h3>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-zinc-900 text-zinc-400"
            title="New file"
          >
            <FilePlus size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-zinc-900 text-zinc-400"
            title="New folder"
          >
            <FolderPlus size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-zinc-900 text-zinc-400"
            title="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* File tree list */}
      <div className="flex-1 overflow-auto p-1">
        {files.map((file) => renderItem(file))}
      </div>

      {/* Context menu (shown when right-clicking) */}
      {contextMenu && (
        <div
          className="absolute bg-zinc-900 border border-zinc-700 rounded shadow-lg py-1 z-50"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <button className="w-full text-left px-3 py-1 text-sm hover:bg-zinc-800 flex items-center gap-2">
            <FilePlus size={14} />
            <span>New File</span>
          </button>
          <button className="w-full text-left px-3 py-1 text-sm hover:bg-zinc-800 flex items-center gap-2">
            <FolderPlus size={14} />
            <span>New Folder</span>
          </button>
          <div className="border-t border-zinc-700 my-1"></div>
          <button className="w-full text-left px-3 py-1 text-sm hover:bg-zinc-800 text-red-500 flex items-center gap-2">
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper component to show appropriate icon based on file extension
const FileIcon = ({
  fileName,
  className = "",
}: {
  fileName: string;
  className?: string;
}) => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Return appropriate icon based on file extension
  switch (extension) {
    case "js":
      return <File size={16} className={cn("text-yellow-500", className)} />;
    case "ts":
      return <File size={16} className={cn("text-blue-500", className)} />;
    case "jsx":
    case "tsx":
      return <File size={16} className={cn("text-blue-400", className)} />;
    case "css":
      return <File size={16} className={cn("text-cyan-500", className)} />;
    case "html":
      return <File size={16} className={cn("text-orange-500", className)} />;
    case "json":
      return <File size={16} className={cn("text-yellow-300", className)} />;
    case "md":
      return <File size={16} className={cn("text-white", className)} />;
    default:
      return <File size={16} className={cn("text-zinc-400", className)} />;
  }
};

export default FileTree;
