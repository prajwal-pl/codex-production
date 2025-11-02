"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { acceptInvitation, rejectInvitation } from "@/lib/api-client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { ProjectInvitation } from "@/types/teams";

interface InvitationCardProps {
    invitation: ProjectInvitation;
    onUpdate: () => void;
}

export function InvitationCard({ invitation, onUpdate }: InvitationCardProps) {
    const handleAccept = async () => {
        try {
            await acceptInvitation(invitation.id);
            toast.success("Invitation accepted!");
            onUpdate();
        } catch (error) {
            toast.error("Failed to accept invitation");
        }
    };

    const handleReject = async () => {
        try {
            await rejectInvitation(invitation.id);
            toast.success("Invitation rejected");
            onUpdate();
        } catch (error) {
            toast.error("Failed to reject invitation");
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{invitation.sender?.name[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold">{invitation.sender?.name || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">
                                invited you to collaborate
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-2">
                    <div>
                        <span className="font-medium">Project: </span>
                        {invitation.project?.title || "Unknown Project"}
                    </div>
                    <div>
                        <span className="font-medium">Role: </span>
                        <Badge>{invitation.role}</Badge>
                    </div>
                    {invitation.message && (
                        <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                            &quot;{invitation.message}&quot;
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex gap-2">
                <Button onClick={handleAccept} className="flex-1 flex items-center gap-2">
                    <Check className="h-4 w-4" /> Accept
                </Button>
                <Button onClick={handleReject} variant="outline" className="flex-1 flex items-center gap-2">
                    <X className="h-4 w-4" /> Decline
                </Button>
            </CardFooter>
        </Card>
    );
}
