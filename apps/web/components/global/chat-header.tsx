import React from "react";
import { Bot, MoreVertical } from "lucide-react";

export const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-zinc-800/30 dark:bg-zinc-800/30">
          <Bot size={20} className="text-zinc-400 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Powered by GPT-4</p>
        </div>
      </div>
      <button className="p-2 rounded-full hover:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors">
        <MoreVertical size={18} className="text-muted-foreground" />
      </button>
    </div>
  );
};
