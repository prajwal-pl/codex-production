"use client";

import React from "react";
import { Editor } from "@monaco-editor/react";

function CodeEditor() {
  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        theme="vs-dark"
        height="100%"
        width="100%"
        language="javascript"
        defaultValue="// Write your code here\nconsole.log('Hello world!');"
        options={{
          minimap: { enabled: false },
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          renderWhitespace: "selection",
          fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
          fontLigatures: true,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          contextmenu: true,
          renderLineHighlight: "all",
          lineHeight: 1.6,
          letterSpacing: 0.5,
          fontSize: 13,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}

export default CodeEditor;
