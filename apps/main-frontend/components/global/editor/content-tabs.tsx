"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, MonitorPlay } from "lucide-react";
import { CodeViewer } from "./code-viewer";
import { PreviewPanel } from "./preview-panel";

interface ContentTabsProps {
    previewUrl?: string;
    isLoading?: boolean;
    error?: string;
    selectedFile?: string;
    fileContent?: string;
    isLoadingFile?: boolean;
}

export const ContentTabs: React.FC<ContentTabsProps> = ({
    previewUrl,
    isLoading,
    error,
    selectedFile,
    fileContent,
    isLoadingFile,
}) => {
    return (
        <Tabs defaultValue="preview" className="flex h-full flex-col">
            <div className="border-b bg-card">
                <TabsList className="h-11 w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                    <TabsTrigger
                        value="preview"
                        className="relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                        <MonitorPlay className="mr-2 size-4" />
                        Preview
                    </TabsTrigger>
                    <TabsTrigger
                        value="code"
                        className="relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    >
                        <Code2 className="mr-2 size-4" />
                        Code
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="preview" className="mt-0 flex-1 overflow-hidden">
                <PreviewPanel
                    previewUrl={previewUrl}
                    isLoading={isLoading}
                    error={error}
                />
            </TabsContent>

            <TabsContent value="code" className="mt-0 flex-1 overflow-hidden">
                <CodeViewer
                    selectedFile={selectedFile}
                    fileContent={fileContent}
                    isLoading={isLoadingFile}
                />
            </TabsContent>
        </Tabs>
    );
};
