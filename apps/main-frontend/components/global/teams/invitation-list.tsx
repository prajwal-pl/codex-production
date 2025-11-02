"use client";

import { useEffect, useState } from "react";
import { getReceivedInvitations } from "@/lib/api-client";
import { InvitationCard } from "./invitation-card";
import type { ProjectInvitation } from "@/types/teams";

export function InvitationList() {
    const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const res = await getReceivedInvitations();
            setInvitations(res.invitations);
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    if (loading) {
        return <div className="text-center text-muted-foreground py-8">Loading invitations...</div>;
    }

    if (invitations.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No pending invitations</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {invitations.map((invitation) => (
                <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onUpdate={fetchInvitations}
                />
            ))}
        </div>
    );
}
