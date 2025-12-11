"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderGit2,
  Code2,
  Trophy,
  MessageSquare,
} from "lucide-react";
import type { ProfileStats } from "@/types/profile";

interface ProfileStatsCardsProps {
  stats: ProfileStats | null;
  loading: boolean;
}

export function ProfileStatsCards({ stats, loading }: ProfileStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Projects",
      value: stats.projects.total,
      subtitle: `${stats.projects.completed} completed`,
      icon: FolderGit2,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      title: "Code Executions",
      value: stats.projects.executions,
      subtitle: `${stats.projects.successRate}% success rate`,
      icon: Code2,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      title: "DSA Submissions",
      value: stats.dsa.total,
      subtitle: `${stats.dsa.accepted} accepted`,
      icon: Trophy,
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
    },
    {
      title: "Community",
      value: stats.community.posts,
      subtitle: `${stats.community.comments} comments`,
      icon: MessageSquare,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-lg ${card.iconBg} flex items-center justify-center`}
              >
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
