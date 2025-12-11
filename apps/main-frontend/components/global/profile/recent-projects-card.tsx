"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, Clock } from "lucide-react";
import type { RecentProject } from "@/types/profile";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface RecentProjectsCardProps {
  projects: RecentProject[] | null;
  loading: boolean;
}

export function RecentProjectsCard({
  projects,
  loading,
}: RecentProjectsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5" />
            Recent Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5" />
            Recent Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FolderGit2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No projects yet</p>
            <p className="text-sm">Start building something awesome!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderGit2 className="h-5 w-5" />
          Recent Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/editor/${project.id}`}
              className="flex items-center justify-between group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {project.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {project._count.executions} runs
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
