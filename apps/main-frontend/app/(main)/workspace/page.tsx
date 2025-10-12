"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconFileText, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { getAllProjects } from "@/lib/api-client";
import type { ProjectSummary } from "@/types/api";

const WorkspacePage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects();
        setProjects(response.projects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const colors = {
      COMPLETED: "bg-green-500/10 text-green-500",
      RUNNING: "bg-blue-500/10 text-blue-500",
      PENDING: "bg-yellow-500/10 text-yellow-500",
      FAILED: "bg-red-500/10 text-red-500",
      CANCELLED: "bg-gray-500/10 text-gray-500",
    };
    const color = colors[status as keyof typeof colors] || "bg-gray-500/10 text-gray-500";
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <IconFileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first AI project to get started
          </p>
          <Button onClick={() => router.push("/editor")}>
            <IconPlus /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6 @5xl/main:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:bg-muted/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <IconFileText className="text-muted-foreground shrink-0" />
                  <CardTitle className="text-base truncate">{project.title}</CardTitle>
                </div>
                {project.lastExecution && getStatusBadge(project.lastExecution.status)}
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="text-muted-foreground space-y-1">
                  {project.description && (
                    <p className="line-clamp-2">{project.description}</p>
                  )}
                  <p className="text-xs">
                    Updated {formatDate(project.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center justify-end">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/editor/${project.id}`}>Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
