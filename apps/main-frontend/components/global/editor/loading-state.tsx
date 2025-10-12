"use client";

import React from "react";
import { Loader2, Code2, FileCode, Rocket, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types/api";

interface LoadingStateProps {
    status?: JobStatus | "INITIALIZING" | "NAVIGATING";
    message?: string;
    showSteps?: boolean;
    className?: string;
}

const STATUS_CONFIG: Record<
    JobStatus | "INITIALIZING" | "NAVIGATING",
    {
        label: string;
        icon: React.ReactNode;
        description: string;
        color: string;
    }
> = {
    INITIALIZING: {
        label: "Initializing",
        icon: <Loader2 className="size-5 animate-spin" />,
        description: "Setting up your project...",
        color: "text-blue-500",
    },
    NAVIGATING: {
        label: "Redirecting",
        icon: <Loader2 className="size-5 animate-spin" />,
        description: "Taking you to your project...",
        color: "text-blue-500",
    },
    PENDING: {
        label: "Queued",
        icon: <Loader2 className="size-5 animate-spin" />,
        description: "Your request is in the queue...",
        color: "text-yellow-500",
    },
    RUNNING: {
        label: "Processing",
        icon: <Code2 className="size-5 animate-pulse" />,
        description: "AI is analyzing your request...",
        color: "text-blue-500",
    },
    STREAMING: {
        label: "Generating Code",
        icon: <FileCode className="size-5 animate-pulse" />,
        description: "Writing your application code...",
        color: "text-purple-500",
    },
    EXECUTING: {
        label: "Setting Up Environment",
        icon: <Rocket className="size-5 animate-bounce" />,
        description: "Creating sandbox and installing dependencies...",
        color: "text-green-500",
    },
    COMPLETED: {
        label: "Complete",
        icon: <CheckCircle2 className="size-5" />,
        description: "Your project is ready!",
        color: "text-green-600",
    },
    FAILED: {
        label: "Failed",
        icon: <CheckCircle2 className="size-5" />,
        description: "Something went wrong",
        color: "text-red-500",
    },
    CANCELLED: {
        label: "Cancelled",
        icon: <CheckCircle2 className="size-5" />,
        description: "Operation cancelled",
        color: "text-gray-500",
    },
};

const LOADING_STEPS = [
    { label: "Analyzing request", delay: 0 },
    { label: "Generating code", delay: 800 },
    { label: "Setting up environment", delay: 1600 },
    { label: "Installing dependencies", delay: 2400 },
];

export function LoadingState({
    status = "INITIALIZING",
    message,
    showSteps = false,
    className,
}: LoadingStateProps) {
    const [currentStep, setCurrentStep] = React.useState(0);
    const config = STATUS_CONFIG[status];

    React.useEffect(() => {
        if (!showSteps) return;

        const timers = LOADING_STEPS.map((step, index) =>
            setTimeout(() => setCurrentStep(index), step.delay)
        );

        return () => timers.forEach(clearTimeout);
    }, [showSteps]);

    return (
        <div className={cn("flex h-screen items-center justify-center bg-background", className)}>
            <div className="w-full max-w-md space-y-8 px-4">
                {/* Main Loading Icon */}
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div
                        className={cn(
                            "relative flex size-20 items-center justify-center rounded-full border-2 bg-card shadow-lg",
                            config.color
                        )}
                    >
                        {config.icon}
                        {status !== "COMPLETED" && status !== "FAILED" && status !== "CANCELLED" && (
                            <div className="absolute inset-0 animate-ping rounded-full border-2 opacity-20" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h2 className={cn("text-xl font-semibold", config.color)}>
                            {config.label}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {message || config.description}
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                {showSteps && status !== "COMPLETED" && status !== "FAILED" && (
                    <div className="space-y-3 rounded-lg border bg-card p-4">
                        {LOADING_STEPS.map((step, index) => (
                            <div
                                key={step.label}
                                className={cn(
                                    "flex items-center gap-3 transition-all duration-300",
                                    index <= currentStep ? "opacity-100" : "opacity-30"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-6 items-center justify-center rounded-full border-2 transition-colors",
                                        index < currentStep
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : index === currentStep
                                                ? "border-primary bg-transparent text-primary"
                                                : "border-muted-foreground/30 bg-transparent text-muted-foreground/30"
                                    )}
                                >
                                    {index < currentStep ? (
                                        <CheckCircle2 className="size-4" />
                                    ) : index === currentStep ? (
                                        <Loader2 className="size-3 animate-spin" />
                                    ) : (
                                        <span className="text-xs font-semibold">{index + 1}</span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-sm transition-colors",
                                        index <= currentStep
                                            ? "font-medium text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading Bar */}
                {status !== "COMPLETED" && status !== "FAILED" && status !== "CANCELLED" && (
                    <div className="relative h-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn(
                                "h-full animate-loading-bar rounded-full",
                                config.color.replace("text-", "bg-")
                            )}
                        />
                    </div>
                )}

                {/* Hint Text */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        This may take a few moments. Please don't close this page.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Add this to your globals.css for the loading bar animation
// @keyframes loading-bar {
//   0% { width: 0%; transform: translateX(0); }
//   50% { width: 50%; transform: translateX(50%); }
//   100% { width: 100%; transform: translateX(0); }
// }
// .animate-loading-bar {
//   animation: loading-bar 1.5s ease-in-out infinite;
// }
