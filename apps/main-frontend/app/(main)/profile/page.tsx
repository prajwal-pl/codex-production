"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileHeader,
  ProfileStatsCards,
  RecentProjectsCard,
  RecentSubmissionsCard,
  ActivityChartCard,
  EditProfileDialog,
} from "@/components/global/profile";
import { getUserProfile, getProfileStats } from "@/lib/api-client";
import type { UserProfile, ProfileStats } from "@/types/profile";
import { User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await getUserProfile();
      setUser(response.user);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      router.push("/sign-in");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await getProfileStats();
      setStats(response.stats);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileUpdated = () => {
    fetchProfile();
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your profile information
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          loading={loadingProfile}
          onEdit={() => setEditDialogOpen(true)}
        />

        {/* Stats Cards */}
        <ProfileStatsCards stats={stats} loading={loadingStats} />

        {/* Activity Chart */}
        <ActivityChartCard
          activityData={stats?.activityData || null}
          loading={loadingStats}
        />

        {/* Recent Activity Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <RecentProjectsCard
            projects={stats?.recentProjects || null}
            loading={loadingStats}
          />
          <RecentSubmissionsCard
            submissions={stats?.recentSubmissions || null}
            loading={loadingStats}
          />
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {user && (
        <EditProfileDialog
          user={user}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleProfileUpdated}
        />
      )}
    </div>
  );
}
