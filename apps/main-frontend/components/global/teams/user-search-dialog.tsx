"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { searchUsers, sendProjectInvitation, getAllProjects } from "@/lib/api-client";
import { Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/teams";
import type { ProjectSummary } from "@/types/api";

interface UserSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preselectedProjectId?: string;
}

export function UserSearchDialog({
    open,
    onOpenChange,
    preselectedProjectId,
}: UserSearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedProject, setSelectedProject] = useState(preselectedProjectId || "");
    const [message, setMessage] = useState("");
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Fetch user's projects on open
    useEffect(() => {
        if (open) {
            getAllProjects().then((res) => setProjects(res.projects)).catch(console.error);
        }
    }, [open]);

    // Update selected project when preselected changes
    useEffect(() => {
        if (preselectedProjectId) {
            setSelectedProject(preselectedProjectId);
        }
    }, [preselectedProjectId]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                setSearching(true);
                searchUsers(searchQuery)
                    .then((res) => setSearchResults(res.users))
                    .catch((error) => {
                        console.error("Search error:", error);
                        toast.error("Failed to search users");
                    })
                    .finally(() => setSearching(false));
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSendInvite = async () => {
        if (!selectedUser || !selectedProject) {
            toast.error("Please select a user and project");
            return;
        }

        setLoading(true);
        try {
            await sendProjectInvitation({
                projectId: selectedProject,
                receiverId: selectedUser.id,
                message: message || undefined,
            });
            toast.success(`Invitation sent to ${selectedUser.name}`);
            onOpenChange(false);
            // Reset state
            setSearchQuery("");
            setSelectedUser(null);
            setMessage("");
            setSearchResults([]);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send invitation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Invite User to Project</DialogTitle>
                    <DialogDescription>
                        Search for users by name or email and send them an invitation to collaborate
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Search Users</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {searching && (
                            <p className="text-xs text-muted-foreground mt-2">Searching...</p>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && !selectedUser && (
                        <div className="border rounded-lg max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setSearchQuery("");
                                        setSearchResults([]);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                                >
                                    <Avatar>
                                        <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected User */}
                    {selectedUser && (
                        <div>
                            <label className="text-sm font-medium mb-2 block">Selected User</label>
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted">
                                <Avatar>
                                    <AvatarFallback>{selectedUser.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-medium">{selectedUser.name}</div>
                                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedUser(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Project Selection */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Select Project</label>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Optional Message */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Message (Optional)
                        </label>
                        <Textarea
                            placeholder="Add a personal message to your invitation..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendInvite}
                            disabled={loading || !selectedUser || !selectedProject}
                        >
                            {loading ? (
                                "Sending..."
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" /> Send Invitation
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
