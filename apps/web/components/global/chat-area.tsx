import React, { useEffect, useRef } from "react";
import { Message } from "./chat-interface";
import { Loader2 } from "lucide-react";
import { cn } from "components/lib/utils";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex flex-col max-w-[85%] rounded-lg p-4",
            message.role === "user"
              ? "ml-auto bg-zinc-800 text-white"
              : "mr-auto bg-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Display attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index}>
                  {attachment.type === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name || "Image attachment"}
                      className="max-h-60 rounded-md mt-2"
                    />
                  ) : attachment.type === "audio" ? (
                    <audio
                      src={attachment.url}
                      controls
                      className="mt-2 w-full"
                    />
                  ) : (
                    <div className="mt-2 text-xs flex items-center gap-2">
                      <div className="p-2 bg-black/20 dark:bg-black/40 rounded">
                        📎
                      </div>
                      <span>{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div
            className={cn(
              "text-xs mt-1",
              message.role === "user" ? "text-zinc-400" : "text-zinc-500"
            )}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400">
          <Loader2 className="animate-spin h-4 w-4" />
          <p>AI is thinking...</p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
