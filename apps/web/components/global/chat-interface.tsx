"use client";

import React, { useState } from "react";
import { ChatHeader } from "./chat-header";
import { ChatArea } from "./chat-area";
import { ChatInput } from "./chat-input";

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  attachments?: {
    type: "image" | "file" | "audio";
    url: string;
    name?: string;
  }[];
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      content: "Hello! How can I help you with your project today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    // Create a new user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: "user",
      timestamp: new Date(),
      attachments: attachments?.map((file) => ({
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("audio/")
            ? "audio"
            : "file",
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        content: `I've processed your message: "${content}"${
          attachments && attachments.length > 0
            ? ` and received ${attachments.length} attachment(s)`
            : ""
        }`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full border-zinc-800 bg-black dark:bg-zinc-950">
      <ChatHeader />
      <ChatArea messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatInterface;
