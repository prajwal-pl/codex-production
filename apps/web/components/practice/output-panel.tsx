"use client";
import useCodeStore from "components/lib/store";
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useState } from "react";

const OutputPanel = () => {
  const { output, isRunning, error } = useCodeStore();

  if (isRunning) {
    return (
      <div className="w-1/2 rounded p-6 border-2 border-muted bg-muted flex justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (output && output.length > 0) {
    return (
      <div className="w-1/2 rounded p-2 border-2 border-muted bg-muted">
        <div className="p-4">
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    );
  }

  if (error && error.length > 0) {
    return (
      <div className="w-1/2 rounded p-2 border-2 border-muted bg-muted">
        <div className="p-4">
          <span className="text-red-500 flex items-center justify-center gap-2 text-xl">
            <AlertTriangle />
            An Error Occured
          </span>
          <pre className="whitespace-pre-wrap text-red-500">{error}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/2 rounded p-2 border-2 border-muted bg-muted">
      <div className="p-4">
        <p className="text-muted-foreground">Run to see output!</p>
      </div>
    </div>
  );
};

export default OutputPanel;
