"use client";

import { useState } from "react";
import { PostList, CreatePostDialog } from "@/components/global/community";
import { useSession } from "@/hooks/useSession";
import { Users, MessageSquare, Sparkles } from "lucide-react";

export default function CommunityPage() {
  const { user } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Community
              </h1>
              <p className="text-muted-foreground mt-1">
                Share ideas, ask questions, and connect with fellow developers
              </p>
            </div>
            {user && <CreatePostDialog onSuccess={handlePostCreated} />}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">Posts</p>
                <p className="text-xs text-muted-foreground">Community discussions</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">Members</p>
                <p className="text-xs text-muted-foreground">Active community</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/50 p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-xs text-muted-foreground">Vibrant discussions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <PostList currentUserId={user?.id} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
