"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { RecentSubmission } from "@/types/profile";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface RecentSubmissionsCardProps {
  submissions: RecentSubmission[] | null;
  loading: boolean;
}

const difficultyColors = {
  EASY: "bg-green-500/10 text-green-500 border-green-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  HARD: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons = {
  ACCEPTED: { icon: CheckCircle, color: "text-green-500" },
  WRONG_ANSWER: { icon: XCircle, color: "text-red-500" },
  TIME_LIMIT_EXCEEDED: { icon: AlertCircle, color: "text-yellow-500" },
  RUNTIME_ERROR: { icon: AlertCircle, color: "text-red-500" },
  PENDING: { icon: Clock, color: "text-muted-foreground" },
};

export function RecentSubmissionsCard({
  submissions,
  loading,
}: RecentSubmissionsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Submissions
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

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No submissions yet</p>
            <p className="text-sm">Start practicing DSA problems!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Recent Submissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission) => {
            const statusConfig =
              statusIcons[submission.status as keyof typeof statusIcons] ||
              statusIcons.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <Link
                key={submission.id}
                href={`/practice/${submission.problem.id}`}
                className="flex items-center justify-between group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={`h-4 w-4 ${statusConfig.color} shrink-0`}
                    />
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {submission.problem.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-6">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(submission.submittedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`ml-2 shrink-0 ${difficultyColors[submission.problem.difficulty]}`}
                >
                  {submission.problem.difficulty}
                </Badge>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
