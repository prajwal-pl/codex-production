"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    isLoading = false,
    disabled = false,
    placeholder = "Ask me anything about programming..."
}: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [message]);

    const handleSubmit = () => {
        if (message.trim() && !isLoading && !disabled) {
            onSend(message.trim());
            setMessage("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="relative flex items-end gap-2 rounded-xl border border-border bg-card shadow-sm">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={isLoading || disabled}
                        className={cn(
                            "min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 pr-24",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-muted-foreground/60"
                        )}
                        rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            disabled={isLoading || disabled}
                            title="Attach context (coming soon)"
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleSubmit}
                            disabled={!message.trim() || isLoading || disabled}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Shift + Enter</kbd> for new line
                </p>
            </div>
        </div>
    );
}
