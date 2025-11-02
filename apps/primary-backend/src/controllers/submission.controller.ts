import { type Request, type Response } from "express";
import prisma from "@repo/db/client";
import { SubmissionStatus } from "@repo/db/generated/prisma";
import pistonService from "../lib/piston.service.js";

/**
 * Execute code without saving (preview/test run)
 */
export const executeCodeHandler = async (req: Request, res: Response) => {
    try {
        const { language, version, code, stdin } = req.body;

        console.log("Execute code request:", { language, version, hasCode: !!code, hasStdin: !!stdin });

        if (!language || !code) {
            console.log("Missing required fields:", { language: !!language, code: !!code });
            return res.status(400).json({
                message: "Language and code are required",
            });
        }

        // Validate runtime exists
        const runtime = await pistonService.findRuntime(
            language,
            version || "*"
        );
        console.log("Runtime lookup:", { language, version, found: !!runtime });
        if (!runtime) {
            console.log("Runtime not found for:", language);
            return res.status(400).json({
                message: `Runtime not found for language: ${language}`,
            });
        }

        // Execute code
        const result = await pistonService.executeCode({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
            stdin,
        });

        return res.status(200).json({
            message: "Code executed successfully",
            data: {
                language: result.language,
                version: result.version,
                run: result.run,
                compile: result.compile,
            },
        });
    } catch (error) {
        console.error("Code execution error:", error);
        return res.status(500).json({
            message: "Code execution failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Submit code for a problem (run against all test cases)
 */
export const submitCodeHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { problemId, language, code, version } = req.body;

        console.log("Submit code request:", { userId, problemId, language, hasCode: !!code, version });

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!problemId || !language || !code) {
            console.log("Missing required fields:", { problemId: !!problemId, language: !!language, code: !!code });
            return res.status(400).json({
                message: "Problem ID, language, and code are required",
            });
        }

        // Fetch problem with all test cases
        const problem = await prisma.dSAProblem.findUnique({
            where: { id: problemId },
            include: {
                testCases: true,
            },
        });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (problem.testCases.length === 0) {
            return res.status(400).json({
                message: "Problem has no test cases configured",
            });
        }

        // Validate runtime
        const runtime = await pistonService.findRuntime(language, version || "*");
        if (!runtime) {
            return res.status(400).json({
                message: `Runtime not found for language: ${language}`,
            });
        }

        // Run code against all test cases
        const testResults = await pistonService.runTestCases(
            code,
            runtime.language,
            runtime.version,
            problem.testCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
            }))
        );

        console.log("Test results:", JSON.stringify(testResults, null, 2));

        // Determine submission status
        const passedTests = testResults.filter((r) => r.passed).length;
        const totalTests = testResults.length;

        let status: SubmissionStatus = "ACCEPTED";
        if (passedTests === 0 && testResults.some((r) => r.error?.includes("Compilation"))) {
            status = "COMPILATION_ERROR";
        } else if (testResults.some((r) => r.error?.includes("timeout"))) {
            status = "TIME_LIMIT_EXCEEDED";
        } else if (testResults.some((r) => r.error && !r.error.includes("Compilation"))) {
            status = "RUNTIME_ERROR";
        } else if (passedTests < totalTests) {
            status = "WRONG_ANSWER";
        }

        // Calculate execution metrics
        const avgExecutionTime =
            testResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) /
            testResults.length;
        const maxMemory = Math.max(
            ...testResults.map((r) => r.memory || 0)
        );

        // Create submission record
        const submission = await prisma.dSASubmission.create({
            data: {
                userId,
                problemId,
                language: runtime.language,
                version: runtime.version,
                code,
                status,
                passedTests,
                totalTests,
                executionTimeMs: Math.round(avgExecutionTime),
                memoryUsedKb: maxMemory ? Math.round(maxMemory / 1024) : null,
                testResults: testResults.map((result, index) => {
                    const testCase = problem.testCases[index];
                    return {
                        testCaseId: testCase?.id,
                        passed: result.passed,
                        output: result.output,
                        expected: result.expected,
                        stderr: result.stderr,
                        error: result.error,
                        executionTime: result.executionTime,
                        memory: result.memory,
                    };
                }),
                pistonOutput: testResults as any,
            },
            include: {
                problem: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        difficulty: true,
                    },
                },
            },
        });

        // Update problem stats if accepted
        if (status === "ACCEPTED") {
            // Check if this is user's first accepted submission for this problem
            const previousAccepted = await prisma.dSASubmission.count({
                where: {
                    userId,
                    problemId,
                    status: "ACCEPTED",
                    submittedAt: {
                        lt: submission.submittedAt,
                    },
                },
            });

            if (previousAccepted === 0) {
                await prisma.dSAProblem.update({
                    where: { id: problemId },
                    data: {
                        totalSolved: {
                            increment: 1,
                        },
                    },
                });
            }
        }

        return res.status(201).json({
            message: "Code submitted successfully",
            data: {
                ...submission,
                // Only return visible test results to prevent cheating
                testResults: (submission.testResults as any[]).map(
                    (result: any, index: number) => {
                        const testCase = problem.testCases[index];
                        return {
                            ...result,
                            // Hide details for hidden test cases
                            ...(testCase?.isHidden && {
                                output: undefined,
                                expected: undefined,
                                stderr: undefined,
                            }),
                        };
                    }
                ),
            },
        });
    } catch (error) {
        console.error("Submission error:", error);
        return res.status(500).json({
            message: "Submission failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get user's submissions for a specific problem
 */
export const getSubmissionsByProblemHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { problemId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required" });
        }

        const submissions = await prisma.dSASubmission.findMany({
            where: {
                userId,
                problemId,
            },
            orderBy: {
                submittedAt: "desc",
            },
            select: {
                id: true,
                language: true,
                version: true,
                status: true,
                passedTests: true,
                totalTests: true,
                executionTimeMs: true,
                memoryUsedKb: true,
                submittedAt: true,
            },
        });

        return res.status(200).json({
            message: "Submissions fetched successfully",
            data: submissions,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get a specific submission by ID
 */
export const getSubmissionByIdHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!id) {
            return res.status(400).json({ message: "Submission ID is required" });
        }

        const submission = await prisma.dSASubmission.findFirst({
            where: {
                id,
                userId, // Ensure user can only view their own submissions
            },
            include: {
                problem: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        difficulty: true,
                        testCases: {
                            select: {
                                id: true,
                                isHidden: true,
                            },
                        },
                    },
                },
            },
        });

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        // Filter out hidden test case details
        const problemTestCases = submission.problem.testCases;
        const testResults = (submission.testResults as any[])?.map(
            (result: any, index: number) => {
                const isHidden = problemTestCases[index]?.isHidden;
                return {
                    ...result,
                    ...(isHidden && {
                        output: undefined,
                        expected: undefined,
                        stderr: undefined,
                    }),
                };
            }
        );

        return res.status(200).json({
            message: "Submission fetched successfully",
            data: {
                ...submission,
                testResults,
            },
        });
    } catch (error) {
        console.error("Error fetching submission:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get all submissions for current user
 */
export const getAllSubmissionsHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.userId;
        const { limit = "20", offset = "0" } = req.query;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const submissions = await prisma.dSASubmission.findMany({
            where: { userId },
            orderBy: { submittedAt: "desc" },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
            select: {
                id: true,
                language: true,
                status: true,
                passedTests: true,
                totalTests: true,
                executionTimeMs: true,
                submittedAt: true,
                problem: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        difficulty: true,
                    },
                },
            },
        });

        const total = await prisma.dSASubmission.count({
            where: { userId },
        });

        return res.status(200).json({
            message: "Submissions fetched successfully",
            data: {
                submissions,
                total,
                limit: parseInt(limit as string),
                offset: parseInt(offset as string),
            },
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get available Piston runtimes
 */
export const getRuntimesHandler = async (req: Request, res: Response) => {
    try {
        const runtimes = await pistonService.getRuntimes();

        return res.status(200).json({
            message: "Runtimes fetched successfully",
            data: runtimes,
        });
    } catch (error) {
        console.error("Error fetching runtimes:", error);
        return res.status(500).json({
            message: "Failed to fetch runtimes",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
