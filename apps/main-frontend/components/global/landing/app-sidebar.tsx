"use client";

import React, { useEffect, useState } from "react";
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconFolder,
  IconListDetails,
  IconSettings,
  IconTerminal,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/global/landing/nav-documents";
import { NavMain } from "@/components/global/landing/nav-main";
import { NavProjects } from "@/components/global/landing/nav-projects";
import { NavSecondary } from "@/components/global/landing/nav-secondary";
import { NavUser } from "@/components/global/landing/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Terminal } from "lucide-react";
import { getAllProjects } from "@/lib/api-client";
import { useSession } from "@/hooks/useSession";
import type { ProjectSummary } from "@/types/api";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Workspace",
      url: "/workspace",
      icon: IconListDetails,
    },
    {
      title: "Practice",
      url: "/practice",
      icon: IconTerminal,
    },
    {
      title: "Projects",
      url: "/editor",
      icon: IconFolder,
    },
    {
      title: "Teams",
      url: "/teams",
      icon: IconUsers,
    }
  ],
  navSecondary: [
    {
      title: "Community",
      url: "/community",
      icon: IconUsers,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: IconChartBar,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useSession();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects();
        // Only show the 5 most recent projects in the sidebar
        setProjects(response.projects.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch projects for sidebar:", error);
      } finally {
        setProjectsLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (loading) return null;

  if (!user) return null;

  // Convert projects to the format expected by NavProjects
  const formattedProjects = projects.map((project) => ({
    id: project.id,
    name: project.title,
  }));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <Terminal className="!size-5" />
                <span className="text-base font-semibold">Codex Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {projectsLoading ? (
          <div className="px-2 py-2 text-xs text-muted-foreground">
            Loading projects...
          </div>
        ) : (
          <NavProjects projects={formattedProjects} />
        )}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Prajwal",
            email: user?.email || "prajwal@example.com",
            avatar:
              user?.name
                ?.toUpperCase()
                .split(" ")
                .map((n: any) => n[0])
                .join("") || "P",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
