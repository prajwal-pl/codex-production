"use client";
import React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProject, type CreateProjectResponse } from "@/lib/api-client";
import { toast } from "sonner";

const promptSchema = z.object({ prompt: z.string().min(5, "Please enter a longer prompt") });

const WorkspacePage = () => {
  const [prompt, setPrompt] = React.useState("");
  const [result, setResult] = React.useState<CreateProjectResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    const parsed = promptSchema.safeParse({ prompt });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid prompt");
      return;
    }
    try {
      setLoading(true);
      setResult(null);
      const data = await createProject({ prompt });
      setResult(data);
      toast.success("Project created");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New AI Project</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you'd like to generate..."
            rows={5}
          />
          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
            {result?.projectId && (
              <span className="text-sm text-muted-foreground">
                Project ID: {result.projectId}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap break-words text-sm">
              {result.content}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkspacePage;
