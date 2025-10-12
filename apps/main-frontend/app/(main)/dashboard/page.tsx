"use client";
import React from "react";
import { SectionCards } from "@/components/global/dashboard/section-cards";
import { ChartAreaInteractive } from "@/components/global/dashboard/chart-area-interactive";
import { DataTable, schema as tableSchema } from "@/components/global/dashboard/data-table";

const mockRows: Array<{
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
}> = [
    {
      id: 1,
      header: "E-commerce Platform",
      type: "Full-Stack",
      status: "In Progress",
      target: "85%",
      limit: "15 files",
      reviewer: "Assign reviewer",
    },
    {
      id: 2,
      header: "Portfolio Website",
      type: "Frontend",
      status: "Done",
      target: "100%",
      limit: "8 files",
      reviewer: "Assign reviewer",
    },
    {
      id: 3,
      header: "REST API Backend",
      type: "Backend",
      status: "Not Started",
      target: "0%",
      limit: "12 files",
      reviewer: "Assign reviewer",
    },
  ];

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={mockRows as Array<import("zod").z.infer<typeof tableSchema>>} />
    </div>
  );
};

export default DashboardPage;
