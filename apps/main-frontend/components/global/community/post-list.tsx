"use client";

import { useState, useEffect } from "react";
import { PostCard } from "./post-card";
import { getAllPosts } from "@/lib/api-client";
import type { Post } from "@/types/community";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostListProps {
    currentUserId?: string;
    refreshKey?: number;
}

export function PostList({ currentUserId, refreshKey }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllPosts();
            setPosts(response.data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshKey]);

    const handlePostDelete = () => {
        fetchPosts();
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-3/4 mb-3" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                            <div className="mt-4 pt-3 border-t border-border/50">
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-8 text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button variant="outline" onClick={fetchPosts} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (posts.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Be the first to share something with the community. Start a conversation!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onDelete={handlePostDelete}
                />
            ))}
        </div>
    );
}
