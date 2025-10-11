"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = "Ask Codex to modify your project...",
}) => {
    const [value, setValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleSubmit = async () => {
        if (!value.trim() || isSubmitting || disabled) return;

        setIsSubmitting(true);
        try {
            await onSend(value.trim());
            setValue("");

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Shift + Enter
        if (e.key === "Enter" && e.shiftKey && !disabled) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t bg-background p-4">
            <div className="mx-auto max-w-4xl">
                <div className="relative flex items-end gap-2">
                    {/* Textarea */}
                    <div className="relative flex-1">
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled || isSubmitting}
                            rows={1}
                            className={cn(
                                "max-h-32 min-h-[44px] w-full resize-none rounded-lg border bg-muted/30 px-4 py-3 pr-12 text-sm",
                                "placeholder:text-muted-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                "disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                        />

                        {/* Attach button (optional) */}
                        {/* <button
              type="button"
              disabled={disabled || isSubmitting}
              className="absolute bottom-3 right-3 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <Paperclip className="size-4" />
            </button> */}
                    </div>

                    {/* Send button */}
                    <Button
                        size="icon"
                        onClick={handleSubmit}
                        disabled={disabled || isSubmitting || !value.trim()}
                        className="size-11 shrink-0"
                    >
                        {isSubmitting ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Send className="size-4" />
                        )}
                    </Button>
                </div>

                {/* Helper text */}
                <p className="mt-2 text-center text-xs text-muted-foreground">
                    Press <kbd className="rounded border bg-muted px-1.5 py-0.5">Shift</kbd> +{" "}
                    <kbd className="rounded border bg-muted px-1.5 py-0.5">Enter</kbd> to send
                </p>
            </div>
        </div>
    );
};
