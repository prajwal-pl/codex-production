"use client";

import {
    IconDots,
    IconExternalLink,
    IconFolder,
    IconTrash,
    type Icon,
} from "@tabler/icons-react";
import Link from "next/link";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

export function NavProjects({
    projects,
}: {
    projects: {
        id: string;
        name: string;
        icon?: Icon;
    }[];
}) {
    const { isMobile } = useSidebar();

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
            <SidebarMenu>
                {projects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton asChild>
                            <Link href={`/editor/${project.id}`}>
                                {project.icon ? <project.icon /> : <IconFolder />}
                                <span>{project.name}</span>
                            </Link>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction
                                    showOnHover
                                    className="data-[state=open]:bg-accent rounded-sm"
                                >
                                    <IconDots />
                                    <span className="sr-only">More</span>
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-32 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}
                            >
                                <DropdownMenuItem asChild>
                                    <Link href={`/editor/${project.id}`}>
                                        <IconExternalLink />
                                        <span>Open</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive">
                                    <IconTrash />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                ))}
                {projects.length === 0 && (
                    <SidebarMenuItem>
                        <SidebarMenuButton disabled className="text-sidebar-foreground/50">
                            <IconFolder className="text-sidebar-foreground/50" />
                            <span>No projects yet</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-sidebar-foreground/70">
                        <Link href="/editor">
                            <IconDots className="text-sidebar-foreground/70" />
                            <span>View All</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
