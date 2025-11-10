"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, UserMinus, LogOut, ExternalLink, Crown, Users } from "lucide-react";
import { toast } from "sonner";
import { removeMember, leaveProject } from "@/lib/api-client";
import type { ProjectMember, User } from "@/types/teams";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface ProjectMembersCardProps {
    project: {
        id: string;
        title: string;
        description?: string;
        owner: User;
        userRole: "OWNER" | "MEMBER";
        members: ProjectMember[];
        memberCount: number;
        updatedAt: string;
    };
    onUpdate: () => void;
}

export function ProjectMembersCard({ project, onUpdate }: ProjectMembersCardProps) {
    const router = useRouter();
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [loading, setLoading] = useState(false);

    const isOwner = project.userRole === "OWNER";

    const handleRemoveMember = async () => {
        if (!selectedMember) return;

        setLoading(true);
        try {
            await removeMember(project.id, selectedMember.id);
            toast.success(`Removed ${selectedMember.user.name} from project`);
            onUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to remove member");
        } finally {
            setLoading(false);
            setShowRemoveDialog(false);
            setSelectedMember(null);
        }
    };

    const handleLeaveProject = async () => {
        setLoading(true);
        try {
            await leaveProject(project.id);
            toast.success("Left project successfully");
            onUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to leave project");
        } finally {
            setLoading(false);
            setShowLeaveDialog(false);
        }
    };

    const handleOpenProject = () => {
        router.push(`/editor?projectId=${project.id}`);
    };

    return (
        <>
            <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{project.title}</CardTitle>
                                <Badge variant={isOwner ? "default" : "secondary"}>
                                    {isOwner ? (
                                        <>
                                            <Crown className="h-3 w-3 mr-1" />
                                            Owner
                                        </>
                                    ) : (
                                        "Member"
                                    )}
                                </Badge>
                            </div>
                            {project.description && (
                                <CardDescription className="mt-1">
                                    {project.description}
                                </CardDescription>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                                Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleOpenProject}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Owner Info */}
                    <div>
                        <p className="text-sm font-medium mb-2">Project Owner</p>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{project.owner.name?.[0]?.toUpperCase() || "O"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{project.owner.name}</p>
                                <p className="text-xs text-muted-foreground">{project.owner.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Members List */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">
                                <Users className="h-4 w-4 inline mr-1" />
                                Members ({project.memberCount})
                            </p>
                        </div>
                        <div className="space-y-2">
                            {project.members.slice(0, 3).map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarFallback>
                                                {member.user.name?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{member.user.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    {isOwner && member.user.id !== project.owner.id && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowRemoveDialog(true);
                                                    }}
                                                >
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Remove Member
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ))}
                            {project.members.length > 3 && (
                                <p className="text-xs text-center text-muted-foreground pt-1">
                                    +{project.members.length - 3} more member{project.members.length - 3 !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                    <Button onClick={handleOpenProject} className="flex-1">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Project
                    </Button>
                    {!isOwner && (
                        <Button
                            variant="outline"
                            onClick={() => setShowLeaveDialog(true)}
                            className="text-destructive hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Leave Project Dialog */}
            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave &quot;{project.title}&quot;? You will need to be re-invited to rejoin.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeaveProject}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? "Leaving..." : "Leave Project"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Remove Member Dialog */}
            <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {selectedMember?.user.name} from this project? They will need to be re-invited to rejoin.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedMember(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? "Removing..." : "Remove Member"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
