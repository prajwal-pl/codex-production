"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
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

    const handleSubmit = async () => {
        if (!value.trim() || isSubmitting || disabled) return;

        setIsSubmitting(true);
        try {
            await onSend(value.trim());
            setValue("");
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
            <div className="relative flex flex-col gap-2">
                {/* Textarea */}
                <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isSubmitting}
                    rows={3}
                    className={cn(
                        "w-full resize-none rounded-lg border bg-muted/30 px-4 py-3 text-sm",
                        "placeholder:text-muted-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                />

                {/* Send button and helper text */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Press <kbd className="rounded border bg-muted px-1.5 py-0.5">Shift</kbd> +{" "}
                        <kbd className="rounded border bg-muted px-1.5 py-0.5">Enter</kbd> to send
                    </p>

                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={disabled || isSubmitting || !value.trim()}
                        className="shrink-0"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 size-4" />
                                Send
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
