"use client";
import React, { useState } from "react";
import { Play, Loader2, RotateCcw } from "lucide-react";

const OutputPanel = () => {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const runCode = () => {
    setIsLoading(true);
    setHasError(false);

    // Simulate code execution
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% chance of success

      if (success) {
        setOutput(
          "Hello, world!\nCode executed successfully.\n\nOutput:\n> 1 + 1 = 2\n> Array(5) created\n> Process completed in 0.24s"
        );
        setHasError(false);
      } else {
        setOutput(
          "Error: Uncaught ReferenceError: someVar is not defined\n  at <anonymous>:1:1"
        );
        setHasError(true);
      }

      setIsLoading(false);
    }, 1500);
  };

  const clearOutput = () => {
    setOutput("");
    setHasError(false);
  };

  return (
    <div className="h-full flex flex-col dark:bg-zinc-950">
      <div className="border-b dark:border-zinc-800 p-2 flex justify-between items-center">
        <h3 className="font-medium text-sm">Output</h3>
        <div className="flex gap-2">
          <button
            onClick={clearOutput}
            disabled={isLoading || output === ""}
            className="p-1 hover:bg-zinc-900 dark:hover:bg-zinc-800 rounded text-zinc-500 disabled:opacity-50"
            title="Clear output"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={runCode}
            disabled={isLoading}
            className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-white flex items-center gap-1"
            title="Run code"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="text-xs">Running...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span className="text-xs">Run</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div
        className={`flex-1 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap ${hasError ? "text-red-500" : ""}`}
      >
        {output ? (
          output
        ) : (
          <span className="text-zinc-500">
            Run your code to see output here
          </span>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
