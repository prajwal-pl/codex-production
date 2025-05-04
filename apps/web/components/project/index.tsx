"use client";

import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import PromptEditor from "./prompt-editor";
import OutputPanel from "./output-panel";
import Terminal from "./terminal";
import CodeEditor from "./code-editor";
import ChatInterface from "../global/chat-interface";
import FileTree from "./file-tree";

// Define the type for active file content
type ActiveFile = {
  id: string;
  name: string;
  content: string;
  language: string;
};

const ProjectEditor = () => {
  // State to track the active file
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null);

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left panel group with FileTree and Chat */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full">
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} minSize={15} maxSize={85}>
                <FileTree
                  onFileSelect={(file) => {
                    console.log("Selected file:", file.name);
                    // In a real app, you would fetch the file content here
                  }}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={50} minSize={15} maxSize={85}>
                <ChatInterface />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Code editor panel */}
        <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
          <div className="h-full">
            <CodeEditor />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right panel with Output and Terminal */}
        <ResizablePanel defaultSize={35} minSize={20} maxSize={45}>
          <div className="h-full flex flex-col">
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={50}>
                <OutputPanel />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={50}>
                <Terminal />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectEditor;
