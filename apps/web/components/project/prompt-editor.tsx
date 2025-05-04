import React from "react";

const PromptEditor = () => {
  return (
    <div className="h-full p-6 bg-black dark:bg-zinc-950 overflow-auto">
      <h2 className="text-xl font-bold mb-4">Project Documentation</h2>
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">
          This is your project workspace. You can:
        </p>
        <ul className="space-y-2">
          <li>Chat with the AI assistant using the chat panel</li>
          <li>Write and test code in the code editor</li>
          <li>View execution results in the output panel</li>
          <li>Run terminal commands in the terminal panel</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2">Tips:</h3>
        <ul className="space-y-2">
          <li>Use the chat to ask questions about your code</li>
          <li>Upload images or code files by clicking the paperclip icon</li>
          <li>Record voice messages by clicking the microphone icon</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptEditor;
