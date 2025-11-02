"use client";
import React, { useEffect, useState } from "react";
import { SectionCards } from "@/components/global/dashboard/section-cards";
import { ChartAreaInteractive } from "@/components/global/dashboard/chart-area-interactive";
import {
  DataTable,
  schema as tableSchema,
} from "@/components/global/dashboard/data-table";
import { getDashboardStats, getRecentProjects } from "@/lib/api-client";
import type { DashboardStats, RecentProject } from "@/lib/api-client";

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, projectsResponse] = await Promise.all([
          getDashboardStats(),
          getRecentProjects(10),
        ]);

        setStats(statsResponse.data);
        setProjects(projectsResponse.projects);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {stats && <SectionCards stats={stats.overview} />}
      {stats && <ChartAreaInteractive activityData={stats.activityData} />}
      <DataTable
        data={
          projects as Array<import("zod").z.infer<typeof tableSchema>>
        }
      />
    </div>
  );
};

export default DashboardPage;
