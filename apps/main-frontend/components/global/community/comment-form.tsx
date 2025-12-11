"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createComment } from "@/lib/api-client";

interface CommentFormProps {
    postId: string;
    onSuccess: () => void;
}

export function CommentForm({ postId, onSuccess }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error("Please enter a comment");
            return;
        }

        setIsSubmitting(true);
        try {
            await createComment(postId, { content: content.trim() });
            toast.success("Comment added");
            setContent("");
            onSuccess();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                rows={1}
                className="resize-none min-h-[42px] flex-1"
            />
            <Button
                type="submit"
                size="icon"
                disabled={isSubmitting || !content.trim()}
                className="flex-shrink-0"
            >
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
}
