import { type Request, type Response } from "express";
import prisma from "@repo/db/client";
import { JobStatus, SubmissionStatus } from "@repo/db/generated/prisma";

export const getUserProfileHandler = async (req: Request, res: Response) => {
  const userId = req.userId!;
  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        resumeUrl: true,
        githubUrl: true,
        linkedinUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getProfileStatsHandler = async (req: Request, res: Response) => {
  const userId = req.userId!;
  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch all stats in parallel
    const [
      totalProjects,
      totalExecutions,
      completedExecutions,
      totalDSASubmissions,
      acceptedDSASubmissions,
      totalPosts,
      totalComments,
      recentProjects,
      recentSubmissions,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.codeExecution.count({ where: { userId } }),
      prisma.codeExecution.count({
        where: { userId, status: JobStatus.COMPLETED },
      }),
      prisma.dSASubmission.count({ where: { userId } }),
      prisma.dSASubmission.count({
        where: { userId, status: SubmissionStatus.ACCEPTED },
      }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { executions: true } },
        },
      }),
      prisma.dSASubmission.findMany({
        where: { userId },
        orderBy: { submittedAt: "desc" },
        take: 5,
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
        },
      }),
    ]);

    // Calculate activity data for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activityByDay = await prisma.$queryRaw<
      Array<{ date: string; executions: bigint; submissions: bigint }>
    >`
      SELECT 
        dates.date,
        COALESCE(e.count, 0)::bigint as executions,
        COALESCE(s.count, 0)::bigint as submissions
      FROM (
        SELECT generate_series(
          ${thirtyDaysAgo}::date,
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ) dates
      LEFT JOIN (
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM "CodeExecution"
        WHERE "userId" = ${userId} AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
      ) e ON dates.date = e.date
      LEFT JOIN (
        SELECT DATE("submittedAt") as date, COUNT(*) as count
        FROM "DSASubmission"
        WHERE "userId" = ${userId} AND "submittedAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("submittedAt")
      ) s ON dates.date = s.date
      ORDER BY dates.date ASC
    `;

    const activityData = activityByDay.map((row) => ({
      date: new Date(row.date).toISOString().split("T")[0],
      executions: Number(row.executions),
      submissions: Number(row.submissions),
    }));

    res.status(200).json({
      success: true,
      stats: {
        projects: {
          total: totalProjects,
          executions: totalExecutions,
          completed: completedExecutions,
          successRate:
            totalExecutions > 0
              ? ((completedExecutions / totalExecutions) * 100).toFixed(1)
              : "0.0",
        },
        dsa: {
          total: totalDSASubmissions,
          accepted: acceptedDSASubmissions,
          successRate:
            totalDSASubmissions > 0
              ? ((acceptedDSASubmissions / totalDSASubmissions) * 100).toFixed(1)
              : "0.0",
        },
        community: {
          posts: totalPosts,
          comments: totalComments,
        },
        recentProjects,
        recentSubmissions,
        activityData,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, bio, linkedinUrl, resumeUrl, githubUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        bio,
        linkedinUrl,
        resumeUrl,
        githubUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        resumeUrl: true,
        githubUrl: true,
        linkedinUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteProfileHandler = async (req: Request, res: Response) => {
  const userId = req.userId!;
  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
