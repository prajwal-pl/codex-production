"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api-client";
import { toast } from "sonner";

export const EditorHero: React.FC = () => {
    const router = useRouter();
    const [value, setValue] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        if (!value.trim() || isSubmitting) return;

        setIsSubmitting(true);

        // ✅ Show loading toast immediately
        const toastId = toast.loading("Creating your project...", {
            description: "Setting up workspace and starting AI generation",
        });

        try {
            const res = await createProject({
                prompt: value,
            });

            // ✅ Update toast to success
            toast.success("Project created!", {
                id: toastId,
                description: "Redirecting to editor...",
                duration: 2000,
            });

            // ✅ CRITICAL: Force a full page navigation to ensure loading state shows
            // window.location.href bypasses Next.js router cache completely
            window.location.href = `/editor/${res.projectId}`;

        } catch (err) {
            console.error("Failed to create project:", err);
            const errorMessage = err instanceof Error
                ? err.message
                : "Failed to create project. Please try again.";

            // ✅ Update toast to error
            toast.error("Failed to create project", {
                id: toastId,
                description: errorMessage,
                duration: 5000,
            });

            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && e.shiftKey && !isSubmitting) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <section className="flex h-[calc(100vh-var(--header-height,0px)-2rem)] w-full items-center justify-center px-4 md:h-[calc(100vh-var(--header-height,0px)-3rem)]">
            <div className="mx-auto w-full max-w-3xl space-y-8">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
                        <Sparkles className="size-3.5 text-primary" />
                        AI-Powered Development
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        Codex complies your ideas into systems
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Describe your idea and watch it come to life. Create apps and websites through conversation.
                    </p>
                </div>

                {/* Input Card */}
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="space-y-4 p-6">
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what you want to build..."
                            rows={6}
                            disabled={isSubmitting}
                            className="w-full resize-none bg-transparent text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <div className="flex items-center justify-between border-t pt-4">
                            <p className="text-xs text-muted-foreground">
                                Press{" "}
                                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                                    Shift
                                </kbd>{" "}
                                +{" "}
                                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                                    Enter
                                </kbd>{" "}
                                to create
                            </p>

                            <Button
                                onClick={handleSubmit}
                                disabled={!value.trim() || isSubmitting}
                                size="default"
                            >
                                {isSubmitting ? (
                                    "Creating..."
                                ) : (
                                    <>
                                        Create Project
                                        <ArrowRight className="ml-2 size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Optional: Quick examples */}
                <div className="space-y-3">
                    <p className="text-center text-xs font-medium text-muted-foreground">
                        Try these examples:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {[
                            "Build a modern e-commerce store",
                            "Create a personal portfolio website",
                            "Design a task management app",
                        ].map((example) => (
                            <button
                                key={example}
                                onClick={() => setValue(example)}
                                disabled={isSubmitting}
                                className="rounded-full border bg-background px-3 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditorHero;
