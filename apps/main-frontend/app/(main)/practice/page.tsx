"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProblems, getPracticeStats } from "@/lib/api-client";
import type { DSAProblem, PracticeStats } from "@/types/practice";
import { DifficultyBadge } from "@/components/global/practice/difficulty-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCheck, IconSearch, IconTrophy } from "@tabler/icons-react";
import { Difficulty } from "@/types/practice";

const PracticePage = () => {
  const router = useRouter();
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsRes, statsRes] = await Promise.all([
          getProblems({ search: searchQuery, difficulty: difficultyFilter }),
          getPracticeStats().catch(() => null),
        ]);
        setProblems(problemsRes.data);
        if (statsRes) setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, difficultyFilter]);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header Stats */}
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <IconTrophy className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solved</p>
                  <p className="text-2xl font-bold">{stats.totalSolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Easy</p>
                  <p className="font-semibold text-emerald-600">{stats.solvedByDifficulty.easy}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Medium</p>
                  <p className="font-semibold text-amber-600">{stats.solvedByDifficulty.medium}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Hard</p>
                  <p className="font-semibold text-rose-600">{stats.solvedByDifficulty.hard}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attempted</p>
                <p className="text-2xl font-bold">{stats.totalAttempted}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!difficultyFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter(undefined)}
          >
            All
          </Button>
          <Button
            variant={difficultyFilter === Difficulty.EASY ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter(Difficulty.EASY)}
          >
            Easy
          </Button>
          <Button
            variant={difficultyFilter === Difficulty.MEDIUM ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter(Difficulty.MEDIUM)}
          >
            Medium
          </Button>
          <Button
            variant={difficultyFilter === Difficulty.HARD ? "default" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter(Difficulty.HARD)}
          >
            Hard
          </Button>
        </div>
      </div>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
          <CardDescription>Select a problem to start practicing</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No problems found
            </div>
          ) : (
            <div className="divide-y">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="group cursor-pointer py-4 transition-colors hover:bg-muted/50"
                  onClick={() => router.push(`/practice/${problem.slug}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {problem.solved && (
                        <IconCheck className="size-5 text-emerald-500" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary">
                          {problem.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {problem.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <DifficultyBadge difficulty={problem.difficulty} />
                      {problem.acceptanceRate && (
                        <span className="text-sm text-muted-foreground">
                          {problem.acceptanceRate.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticePage;
