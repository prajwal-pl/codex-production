"use client";

import { useState, useEffect } from "react";
import { getCollaborativeProjects } from "@/lib/api-client";
import { ProjectMembersCard } from "./project-members-card";
import { Loader2 } from "lucide-react";
import type { ProjectMember, User } from "@/types/teams";

interface CollaborativeProject {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    owner: User;
    userRole: "OWNER" | "MEMBER";
    members: ProjectMember[];
    memberCount: number;
}

export function TeamProjectsList() {
    const [projects, setProjects] = useState<CollaborativeProject[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await getCollaborativeProjects();
            setProjects(res.projects);
        } catch (error) {
            console.error("Failed to fetch collaborative projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12 border rounded-lg">
                <p>No team projects yet</p>
                <p className="text-sm mt-2">
                    Accept project invitations or create projects and invite collaborators to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <ProjectMembersCard
                    key={project.id}
                    project={project}
                    onUpdate={fetchProjects}
                />
            ))}
        </div>
    );
}
