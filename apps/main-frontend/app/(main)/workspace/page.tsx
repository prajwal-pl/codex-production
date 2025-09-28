"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconFileText } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const WorkspacePage = () => {
  const router = useRouter();

  // Mock projects list to visualize how cards would appear
  const projects: Array<{
    id: string;
    title: string;
    updatedAt: string;
    summary: string;
  }> = [
    {
      id: "p-123",
      title: "Proposal: Project Alpha",
      updatedAt: "2025-09-20",
      summary: "Executive summary and technical approach drafted.",
    },
    {
      id: "p-456",
      title: "Grant Application: HealthTech",
      updatedAt: "2025-09-22",
      summary: "Impact narrative and budget justification prepared.",
    },
    {
      id: "p-789",
      title: "Whitepaper: AI in Logistics",
      updatedAt: "2025-09-25",
      summary: "Outline complete; awaiting case study inputs.",
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Workspace</h2>
          <p className="text-muted-foreground text-sm">
            Create and manage your AI projects.
          </p>
        </div>
        <Button onClick={() => router.push("/editor")}>
          <IconPlus /> New Project
        </Button>
      </div>

      <Separator className="mx-4 lg:mx-6" />

      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6 @5xl/main:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} className="hover:bg-muted/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconFileText className="text-muted-foreground" />
                <CardTitle className="text-base">{p.title}</CardTitle>
              </div>
              <span className="text-muted-foreground text-xs">Updated {p.updatedAt}</span>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>{p.summary}</p>
              <div className="flex items-center justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/editor/${p.id}`}>Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkspacePage;
