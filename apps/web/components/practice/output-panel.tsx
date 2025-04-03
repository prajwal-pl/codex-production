"use client";
import useCodeStore from "components/lib/store";
import { Loader2 } from "lucide-react";
import React from "react";

const OutputPanel = () => {
  const { output, isRunning } = useCodeStore();

  if (isRunning) {
    return (
      <div className="w-1/2 rounded p-6 border-2 border-muted bg-muted flex justify-center">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-1/2 rounded p-2 border-2 border-muted bg-muted">
      <div className="p-4">
        {/* {output && output.length > 0 ? () : (<p>R</p>)} */}
        {output && output.length > 0 ? (
          <pre className="whitespace-pre-wrap">{output}</pre>
        ) : (
          <p className="text-muted-foreground">Run to see output!</p>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
