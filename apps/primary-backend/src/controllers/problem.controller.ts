import { type Request, type Response } from "express";
import prisma from "@repo/db/client";
import { Difficulty } from "@repo/db/generated/prisma";

/**
 * Get all DSA problems with optional filters
 */
export const getAllProblemsHandler = async (req: Request, res: Response) => {
    try {
        const { difficulty, tags, solved, search } = req.query;
        const userId = req.userId;

        // Build where clause
        const where: any = {};

        if (difficulty && typeof difficulty === "string") {
            where.difficulty = difficulty.toUpperCase() as Difficulty;
        }

        if (tags && typeof tags === "string") {
            where.tags = {
                hasSome: tags.split(",").map((tag) => tag.trim()),
            };
        }

        if (search && typeof search === "string") {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        // Fetch problems
        const problems = await prisma.dSAProblem.findMany({
            where,
            select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                tags: true,
                acceptanceRate: true,
                totalSolved: true,
                createdAt: true,
                submissions: userId
                    ? {
                        where: {
                            userId,
                            status: "ACCEPTED",
                        },
                        take: 1,
                        select: { id: true },
                    }
                    : false,
            },
            orderBy: [{ createdAt: "desc" }],
        });

        // Transform to include solved status
        const problemsWithStatus = problems.map((problem) => ({
            ...problem,
            solved: userId ? (problem.submissions as any[]).length > 0 : undefined,
            submissions: undefined, // Remove from response
        }));

        return res.status(200).json({
            message: "Problems fetched successfully",
            data: problemsWithStatus,
        });
    } catch (error) {
        console.error("Error fetching problems:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get single problem by slug
 */
export const getProblemBySlugHandler = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const userId = req.userId;

        if (!slug) {
            return res.status(400).json({ message: "Slug is required" });
        }

        const problem = await prisma.dSAProblem.findUnique({
            where: { slug },
            include: {
                testCases: {
                    where: { isHidden: false }, // Only show visible test cases
                    select: {
                        id: true,
                        input: true,
                        expectedOutput: true,
                        explanation: true,
                    },
                },
                submissions: userId
                    ? {
                        where: { userId },
                        orderBy: { submittedAt: "desc" },
                        take: 5,
                        select: {
                            id: true,
                            status: true,
                            language: true,
                            passedTests: true,
                            totalTests: true,
                            submittedAt: true,
                        },
                    }
                    : false,
            },
        });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        return res.status(200).json({
            message: "Problem fetched successfully",
            data: problem,
        });
    } catch (error) {
        console.error("Error fetching problem:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Create a new DSA problem (admin only - add auth check as needed)
 */
export const createProblemHandler = async (req: Request, res: Response) => {
    try {
        const {
            slug,
            title,
            difficulty,
            description,
            tags,
            constraints,
            examples,
            hints,
            testCases,
        } = req.body;

        // Validation
        if (!slug || !title || !difficulty || !description) {
            return res.status(400).json({
                message: "Slug, title, difficulty, and description are required",
            });
        }

        if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
            return res.status(400).json({
                message: "Difficulty must be EASY, MEDIUM, or HARD",
            });
        }

        // Check if slug already exists
        const existing = await prisma.dSAProblem.findUnique({ where: { slug } });
        if (existing) {
            return res.status(409).json({ message: "Problem slug already exists" });
        }

        // Create problem with test cases
        const problem = await prisma.dSAProblem.create({
            data: {
                slug,
                title,
                difficulty: difficulty as Difficulty,
                description,
                tags: tags || [],
                constraints,
                examples: examples || [],
                hints: hints || [],
                ...(testCases && {
                    testCases: {
                        create: testCases.map((tc: any) => ({
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            isHidden: tc.isHidden || false,
                            explanation: tc.explanation,
                        })),
                    },
                }),
            },
            include: {
                testCases: true,
            },
        });

        return res.status(201).json({
            message: "Problem created successfully",
            data: problem,
        });
    } catch (error) {
        console.error("Error creating problem:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Update a DSA problem (admin only)
 */
export const updateProblemHandler = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const updateData = req.body;

        if (!slug) {
            return res.status(400).json({ message: "Slug is required" });
        }

        // Remove fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.testCases;
        delete updateData.submissions;

        const problem = await prisma.dSAProblem.update({
            where: { slug },
            data: updateData,
        });

        return res.status(200).json({
            message: "Problem updated successfully",
            data: problem,
        });
    } catch (error) {
        console.error("Error updating problem:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Delete a DSA problem (admin only)
 */
export const deleteProblemHandler = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return res.status(400).json({ message: "Slug is required" });
        }

        await prisma.dSAProblem.delete({
            where: { slug },
        });

        return res.status(200).json({
            message: "Problem deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting problem:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get user's practice statistics
 */
export const getPracticeStatsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get submission statistics
        const [totalSolved, totalAttempted, submissionsByDifficulty] =
            await Promise.all([
                // Count unique problems with accepted submissions
                prisma.dSASubmission.findMany({
                    where: { userId, status: "ACCEPTED" },
                    distinct: ["problemId"],
                    select: { problemId: true },
                }),
                // Count unique problems attempted
                prisma.dSASubmission.findMany({
                    where: { userId },
                    distinct: ["problemId"],
                    select: { problemId: true },
                }),
                // Count by difficulty
                prisma.$queryRaw`
          SELECT 
            p.difficulty,
            COUNT(DISTINCT s."problemId") as count
          FROM "DSASubmission" s
          JOIN "DSAProblem" p ON s."problemId" = p.id
          WHERE s."userId" = ${userId} AND s.status = 'ACCEPTED'
          GROUP BY p.difficulty
        `,
            ]);

        const difficultyMap = (submissionsByDifficulty as any[]).reduce(
            (acc, item) => {
                acc[item.difficulty.toLowerCase()] = Number(item.count);
                return acc;
            },
            { easy: 0, medium: 0, hard: 0 }
        );

        return res.status(200).json({
            message: "Stats fetched successfully",
            data: {
                totalSolved: totalSolved.length,
                totalAttempted: totalAttempted.length,
                solvedByDifficulty: difficultyMap,
            },
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
