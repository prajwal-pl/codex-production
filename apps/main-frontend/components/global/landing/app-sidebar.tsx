"use client";

import React, { useEffect } from "react";
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
import { getProfile } from "@/lib/api-client";
import { useSession } from "@/hooks/useSession";

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
  projects: [
    {
      id: "proj_1",
      name: "E-commerce Store",
    },
    {
      id: "proj_2",
      name: "Portfolio Website",
    },
    {
      id: "proj_3",
      name: "Task Manager App",
    },
    {
      id: "proj_4",
      name: "Landing Page",
    },
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

  if (loading) return null;

  if (!user) return null;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Terminal className="!size-5" />
                <span className="text-base font-semibold">Codex Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
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
