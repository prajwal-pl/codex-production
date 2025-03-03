"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  FolderGit2,
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings2,
  SquareTerminal,
  Star,
  Users,
  Wallet,
  History,
  Code,
} from "lucide-react";

import { NavMain } from "components/sidebar/nav-main";
import { NavProjects } from "components/sidebar/nav-projects";
import { NavUser } from "components/sidebar/nav-user";
import { TeamSwitcher } from "components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Workspace",
      url: "/workspace",
      icon: SquareTerminal,
    },
    {
      title: "Practice",
      url: "/practice",
      icon: Code,
    },
    {
      title: "History",
      url: "/history",
      icon: History,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: Wallet,
    },

    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
  projects: [
    {
      name: "Community",
      url: "/community",
      icon: Users,
    },
    {
      name: "Favorites",
      url: "/favorites",
      icon: Star,
    },
    {
      name: "Your Projects",
      url: "/your-projects",
      icon: FolderGit2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
