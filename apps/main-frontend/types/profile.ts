// Profile Types

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStats {
  projects: {
    total: number;
    executions: number;
    completed: number;
    successRate: string;
  };
  dsa: {
    total: number;
    accepted: number;
    successRate: string;
  };
  community: {
    posts: number;
    comments: number;
  };
  recentProjects: RecentProject[];
  recentSubmissions: RecentSubmission[];
  activityData: ActivityDataPoint[];
}

export interface RecentProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    executions: number;
  };
}

export interface RecentSubmission {
  id: string;
  status: string;
  submittedAt: string;
  problem: {
    id: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
  };
}

export interface ActivityDataPoint {
  date: string;
  executions: number;
  submissions: number;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  githubUrl?: string;
}

export interface GetProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface GetProfileStatsResponse {
  success: boolean;
  stats: ProfileStats;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export interface DeleteProfileResponse {
  success: boolean;
  message: string;
}
