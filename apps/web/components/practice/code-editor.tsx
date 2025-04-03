"use client";
import React, { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import useCodeStore from "components/lib/store";
import { LANGUAGE_CONFIG } from "app/utils/constants";

const CodeEditor = () => {
  const { setCode, language } = useCodeStore();
  const [defaultCode, setDefaultCode] = useState<string | undefined>(
    LANGUAGE_CONFIG[language]?.defaultCode
  );
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
  };

  useEffect(() => {
    setDefaultCode(LANGUAGE_CONFIG[language]?.defaultCode);
    setCode(LANGUAGE_CONFIG[language]?.defaultCode || "");
    console.log(LANGUAGE_CONFIG[language]?.defaultCode);
  }, [language]);

  return (
    <div className="rounded border-muted border-2 overflow-hidden">
      <Editor
        theme="vs-dark"
        height={`85vh`}
        width={`80vh`}
        language={language}
        value={defaultCode}
        onChange={handleCodeChange}
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
};

export default CodeEditor;
