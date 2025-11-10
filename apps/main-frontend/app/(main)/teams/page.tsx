"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Globe, BookOpen } from "lucide-react";
import { InvitationList } from "@/components/global/teams/invitation-list";
import { ComingSoonTab } from "@/components/global/teams/coming-soon-tab";
import { UserSearchDialog } from "@/components/global/teams/user-search-dialog";
import { TeamProjectsList } from "@/components/global/teams/team-projects-list";
import { getReceivedInvitations } from "@/lib/api-client";

export default function TeamsPage() {
    const [activeTab, setActiveTab] = useState("teams");
    const [pendingCount, setPendingCount] = useState(0);
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    useEffect(() => {
        // Fetch pending invitations count
        getReceivedInvitations().then((res) => {
            setPendingCount(res.invitations.filter(i => i.status === "PENDING").length);
        }).catch(console.error);
    }, []);

    return (
        <div className="container mx-auto flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Teams & Collaboration</h1>
                    <p className="text-muted-foreground mt-1">
                        Work together on projects and collaborate in real-time
                    </p>
                </div>
                <Button onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite to Project
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="teams" className="relative">
                        Teams
                        {pendingCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {pendingCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="world" disabled className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        World
                        <Badge variant="outline" className="ml-1">Soon</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="learn" disabled className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Learn
                        <Badge variant="outline" className="ml-1">Soon</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Teams Tab */}
                <TabsContent value="teams" className="space-y-6">
                    {/* Pending Invitations Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Pending Invitations {pendingCount > 0 && `(${pendingCount})`}
                        </h2>
                        <InvitationList />
                    </div>

                    {/* Team Projects Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Team Projects</h2>
                        <TeamProjectsList />
                    </div>
                </TabsContent>

                {/* World Tab (Coming Soon) */}
                <TabsContent value="world">
                    <ComingSoonTab
                        title="World"
                        description="Connect with developers worldwide, discover public projects, and collaborate on open-source initiatives."
                        features={[
                            "Explore public projects",
                            "Join open communities",
                            "Contribute to trending repos",
                            "Global leaderboards"
                        ]}
                    />
                </TabsContent>

                {/* Learn Tab (Coming Soon) */}
                <TabsContent value="learn">
                    <ComingSoonTab
                        title="Learn"
                        description="Interactive tutorials, coding challenges, and educational content to enhance your skills."
                        features={[
                            "Step-by-step tutorials",
                            "Interactive coding challenges",
                            "Skill-based learning paths",
                            "Certifications & badges"
                        ]}
                    />
                </TabsContent>
            </Tabs>

            {/* User Search Dialog */}
            <UserSearchDialog
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
            />
        </div>
    );
}