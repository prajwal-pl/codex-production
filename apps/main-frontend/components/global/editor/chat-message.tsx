"use client";

import React from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { User, Bot, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
    message: Message;
    isLatest?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
    const isUser = message.role === "user";
    const hasMetadata = message.metadata && (message.metadata.filesChanged || message.metadata.executionId);

    return (
        <div
            className={cn(
                "group flex w-full gap-3 px-4 py-6 transition-colors",
                isUser ? "bg-background" : "bg-muted/30"
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    isUser
                        ? "bg-primary/10 text-primary"
                        : "bg-accent text-accent-foreground"
                )}
            >
                {isUser ? (
                    <User className="size-4" />
                ) : (
                    <Bot className="size-4" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                        {isUser ? "You" : "Codex"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                    {isLatest && !isUser && (
                        <Badge variant="outline" className="text-xs">
                            Latest
                        </Badge>
                    )}
                </div>

                {/* Message Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {message.content}
                    </p>
                </div>

                {/* Metadata */}
                {hasMetadata && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        {message.metadata?.filesChanged && message.metadata.filesChanged.length > 0 && (
                            <div className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs">
                                <CheckCircle2 className="size-3 text-primary" />
                                <span className="font-medium">
                                    {message.metadata.filesChanged.length} file
                                    {message.metadata.filesChanged.length > 1 ? "s" : ""} modified
                                </span>
                            </div>
                        )}
                        {message.metadata?.executionId && (
                            <div className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-xs">
                                <Clock className="size-3" />
                                <span className="font-medium">Execution ID: {message.metadata.executionId.slice(0, 8)}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
