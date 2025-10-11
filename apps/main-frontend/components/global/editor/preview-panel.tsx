"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
    previewUrl?: string;
    isLoading?: boolean;
    error?: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    previewUrl,
    isLoading = false,
    error,
}) => {
    const [iframeKey, setIframeKey] = useState(0);
    const [iframeLoading, setIframeLoading] = useState(true);

    const handleRefresh = () => {
        setIframeKey((prev) => prev + 1);
        setIframeLoading(true);
    };

    const handleOpenInNewTab = () => {
        if (previewUrl) {
            window.open(previewUrl, "_blank", "noopener,noreferrer");
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/30">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Generating your application...
                </p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/30 p-8">
                <div className="rounded-full bg-destructive/10 p-3">
                    <AlertCircle className="size-6 text-destructive" />
                </div>
                <div className="text-center">
                    <h3 className="font-semibold">Preview Error</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="size-4" />
                    Retry
                </Button>
            </div>
        );
    }

    // Show empty state
    if (!previewUrl) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/30 p-8">
                <div className="text-center">
                    <h3 className="font-semibold">No Preview Available</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Start a conversation to generate your application
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-muted/30">
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-background px-4 py-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Preview
                    </span>
                    <div className={cn(
                        "size-2 rounded-full",
                        iframeLoading ? "bg-yellow-500" : "bg-green-500"
                    )} />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={iframeLoading}
                    >
                        <RefreshCw className={cn(
                            "size-4",
                            iframeLoading && "animate-spin"
                        )} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenInNewTab}
                    >
                        <ExternalLink className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Preview iframe */}
            <div className="relative flex-1">
                {iframeLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                <iframe
                    key={iframeKey}
                    src={previewUrl}
                    className="size-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    onLoad={() => setIframeLoading(false)}
                    onError={() => {
                        setIframeLoading(false);
                    }}
                    title="Application Preview"
                />
            </div>
        </div>
    );
};
