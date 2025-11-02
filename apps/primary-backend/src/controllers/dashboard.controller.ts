import { type Request, type Response } from "express";
import prisma from "@repo/db/client";
import { JobStatus, SubmissionStatus } from "@repo/db/generated/prisma";

/**
 * Get comprehensive dashboard statistics for the authenticated user
 */
export const getDashboardStatsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get date ranges for comparisons
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Fetch all data in parallel
        const [
            totalProjects,
            projectsLastWeek,
            totalExecutions,
            executionsLastMonth,
            totalCodeFiles,
            completedExecutions,
            failedExecutions,
            totalDSASubmissions,
            acceptedDSASubmissions,
            totalPosts,
        ] = await Promise.all([
            // Total projects
            prisma.project.count({
                where: { userId },
            }),

            // Projects created in last week
            prisma.project.count({
                where: {
                    userId,
                    createdAt: { gte: oneWeekAgo },
                },
            }),

            // Total code executions
            prisma.codeExecution.count({
                where: { userId },
            }),

            // Executions in last month
            prisma.codeExecution.count({
                where: {
                    userId,
                    createdAt: { gte: oneMonthAgo },
                },
            }),

            // Total files created across all executions
            prisma.codeArtifact.count({
                where: {
                    execution: { userId },
                },
            }),

            // Successful executions
            prisma.codeExecution.count({
                where: {
                    userId,
                    status: JobStatus.COMPLETED,
                },
            }),

            // Failed executions
            prisma.codeExecution.count({
                where: {
                    userId,
                    status: JobStatus.FAILED,
                },
            }),

            // Total DSA submissions
            prisma.dSASubmission.count({
                where: { userId },
            }),

            // Accepted DSA submissions
            prisma.dSASubmission.count({
                where: {
                    userId,
                    status: SubmissionStatus.ACCEPTED,
                },
            }),

            // Total posts
            prisma.post.count({
                where: { authorId: userId },
            }),
        ]);

        // Calculate success rate
        const successRate =
            totalExecutions > 0
                ? ((completedExecutions / totalExecutions) * 100).toFixed(1)
                : "0.0";

        // Get activity data for the last 90 days (for chart)
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        const executionsByDay = await prisma.$queryRaw<
            Array<{ date: string; count: bigint }>
        >`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::bigint as count
      FROM "CodeExecution"
      WHERE "userId" = ${userId}
        AND "createdAt" >= ${ninetyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

        const dsaSubmissionsByDay = await prisma.$queryRaw<
            Array<{ date: string; count: bigint }>
        >`
      SELECT 
        DATE("submittedAt") as date,
        COUNT(*)::bigint as count
      FROM "DSASubmission"
      WHERE "userId" = ${userId}
        AND "submittedAt" >= ${ninetyDaysAgo}
      GROUP BY DATE("submittedAt")
      ORDER BY date ASC
    `;

        // Merge and format activity data for chart
        const activityMap = new Map<string, { codeExecutions: number; dsaSubmissions: number }>();

        // Initialize all days with 0
        for (let i = 0; i < 90; i++) {
            const date = new Date(ninetyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            activityMap.set(dateStr!, { codeExecutions: 0, dsaSubmissions: 0 });
        }

        // Fill in actual data
        executionsByDay.forEach(({ date, count }) => {
            const dateStr = date ? new Date(date).toISOString().split('T')[0] : null;
            if (!dateStr) return;
            const existing = activityMap.get(dateStr) || { codeExecutions: 0, dsaSubmissions: 0 };
            activityMap.set(dateStr, { ...existing, codeExecutions: Number(count) });
        });

        dsaSubmissionsByDay.forEach(({ date, count }) => {
            const dateStr = date ? new Date(date).toISOString().split('T')[0] : null;
            if (!dateStr) return;
            const existing = activityMap.get(dateStr) || { codeExecutions: 0, dsaSubmissions: 0 };
            activityMap.set(dateStr, { ...existing, dsaSubmissions: Number(count) });
        });

        const activityData = Array.from(activityMap.entries())
            .map(([date, data]) => ({
                date,
                desktop: data.codeExecutions, // Using "desktop" to match existing chart config
                mobile: data.dsaSubmissions,   // Using "mobile" to match existing chart config
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalProjects,
                    projectsLastWeek,
                    projectsGrowth: calculateGrowthPercentage(projectsLastWeek, 0), // Simplified for now
                    totalExecutions,
                    executionsLastMonth,
                    executionsGrowth: calculateGrowthPercentage(executionsLastMonth, 0),
                    totalCodeFiles,
                    successRate: parseFloat(successRate),
                    completedExecutions,
                    failedExecutions,
                    totalDSASubmissions,
                    acceptedDSASubmissions,
                    dsaSuccessRate:
                        totalDSASubmissions > 0
                            ? ((acceptedDSASubmissions / totalDSASubmissions) * 100).toFixed(1)
                            : "0.0",
                    totalPosts,
                },
                activityData, // For the chart
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get recent projects with their latest execution status
 */
export const getRecentProjectsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit as string) || 10;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: limit,
            include: {
                executions: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        completedAt: true,
                        createdFiles: true,
                    },
                },
                _count: {
                    select: {
                        executions: true,
                        prompts: true,
                    },
                },
            },
        });

        const formattedProjects = projects.map((project) => {
            const lastExecution = project.executions[0];

            // Determine project status based on last execution
            let status = "Not Started";
            if (lastExecution) {
                if (lastExecution.status === JobStatus.COMPLETED) {
                    status = "Done";
                } else if (
                    lastExecution.status === JobStatus.RUNNING ||
                    lastExecution.status === JobStatus.STREAMING ||
                    lastExecution.status === JobStatus.EXECUTING
                ) {
                    status = "In Progress";
                } else if (lastExecution.status === JobStatus.FAILED) {
                    status = "Error";
                }
            }

            // Calculate progress based on execution count and status
            const totalExecutions = project._count.executions;
            const completedExecutions = totalExecutions; // Simplified
            const progress =
                totalExecutions > 0
                    ? Math.min(100, (completedExecutions / totalExecutions) * 100)
                    : 0;

            return {
                id: project.id,
                header: project.title,
                type: lastExecution?.createdFiles?.some((f) => f.includes("package.json"))
                    ? lastExecution.createdFiles.some((f) => f.includes("server") || f.includes("api"))
                        ? "Full-Stack"
                        : "Frontend"
                    : "Backend",
                status,
                target: `${Math.round(progress)}%`,
                limit: lastExecution?.createdFiles?.length
                    ? `${lastExecution.createdFiles.length} files`
                    : "0 files",
                reviewer: "Assign reviewer",
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                executionId: lastExecution?.id,
                executionCount: totalExecutions,
                promptCount: project._count.prompts,
            };
        });

        return res.status(200).json({
            success: true,
            projects: formattedProjects,
        });
    } catch (error) {
        console.error("Error fetching recent projects:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch recent projects",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

// Helper function to calculate growth percentage
function calculateGrowthPercentage(current: number, previous: number): string {
    if (previous === 0) {
        return current > 0 ? "+100" : "0";
    }
    const growth = ((current - previous) / previous) * 100;
    return growth > 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1);
}
