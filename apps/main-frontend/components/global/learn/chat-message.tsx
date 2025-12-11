"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/types/learn";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
    message: ChatMessageType;
    userName?: string;
}

export function ChatMessage({ message, userName = "User" }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === "user";
    const isLoading = message.isLoading;

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={cn(
                "group flex gap-3 py-4 px-4",
                isUser ? "bg-transparent" : "bg-muted/30"
            )}
        >
            <Avatar className={cn(
                "h-8 w-8 shrink-0",
                isUser ? "bg-primary/10" : "bg-primary"
            )}>
                <AvatarFallback className={cn(
                    "text-xs font-medium",
                    isUser ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"
                )}>
                    {isUser ? getInitials(userName) : <Bot className="h-4 w-4" />}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        {isUser ? userName : "Codex AI"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </span>
                </div>

                <div className="relative">
                    {isLoading ? (
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                            <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    code({ className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const codeString = String(children).replace(/\n$/, "");
                                        const isInline = !match && !codeString.includes("\n");

                                        if (isInline) {
                                            return (
                                                <code
                                                    className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        }

                                        return (
                                            <div className="relative group/code my-3">
                                                <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 bg-background/80"
                                                        onClick={() => copyToClipboard(codeString)}
                                                    >
                                                        {copied ? (
                                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {match && (
                                                    <div className="absolute left-3 top-2 text-xs text-muted-foreground font-mono">
                                                        {match[1]}
                                                    </div>
                                                )}
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match?.[1] || "text"}
                                                    PreTag="div"
                                                    className="!mt-0 !mb-0 rounded-lg !pt-8"
                                                    customStyle={{
                                                        margin: 0,
                                                        borderRadius: "0.5rem",
                                                        fontSize: "0.875rem",
                                                    }}
                                                >
                                                    {codeString}
                                                </SyntaxHighlighter>
                                            </div>
                                        );
                                    },
                                    p({ children }) {
                                        return <p className="mb-2 last:mb-0">{children}</p>;
                                    },
                                    ul({ children }) {
                                        return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                                    },
                                    ol({ children }) {
                                        return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                                    },
                                    li({ children }) {
                                        return <li className="mb-1">{children}</li>;
                                    },
                                    h1({ children }) {
                                        return <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>;
                                    },
                                    h2({ children }) {
                                        return <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>;
                                    },
                                    h3({ children }) {
                                        return <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>;
                                    },
                                    blockquote({ children }) {
                                        return (
                                            <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
                                                {children}
                                            </blockquote>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    {!isLoading && !isUser && (
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground"
                                onClick={() => copyToClipboard(message.content)}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy response
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
