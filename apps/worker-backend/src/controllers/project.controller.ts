import { type Request, type Response } from "express";
import { tasks } from "@trigger.dev/sdk/v3";
import prisma from "@repo/db/client";
import { codeEngineTask } from "../trigger/example.js";
import type { CodeExecutionPayload } from "../types/index.js";
import { JobStatus, PromptRole } from "@repo/db/generated/prisma";

/**
 * Trigger code generation and execution
 */
export const createProjectHandler = async (req: Request, res: Response) => {
  const { prompt, projectId } = req.body;
  const userId = req.userId!;

  try {
    // Build messages array
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

    let currentProjectId = projectId;

    // If existing project, load conversation history
    if (projectId) {
      const existingPrompts = await prisma.prompt.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" },
      });

      existingPrompts
        .filter((p) => p.content && p.content.trim() !== "")
        .forEach((p) => {
          messages.push({
            role: p.role.toLowerCase() as "user" | "assistant",
            content: p.content,
          });
        });
    } else {
      // Create new project
      const newProject = await prisma.project.create({
        data: {
          title: "New Project",
          description: "AI-generated web application",
          userId,
        },
      });
      currentProjectId = newProject.id;
    }

    // Add current user prompt
    messages.push({
      role: "user",
      content: prompt,
    });

    // Save user prompt to database
    await prisma.prompt.create({
      data: {
        content: prompt,
        role: "USER",
        projectId: currentProjectId,
        createdBy: userId,
      },
    });

    // Prepare payload for Trigger.dev task
    const payload: CodeExecutionPayload = {
      projectId: currentProjectId,
      userId,
      messages,
      conversationTurn: 1,
      existingFiles: [],
      fileContents: [], // ✅ Empty for first message
      sandboxConfig: {
        template: "NODE_22", // or custom template ID
        timeout: 300000, // 5 minutes
        keepAlive: true,
        reuseSandbox: false,
      },
    };

    // Trigger the background job
    const handle = await tasks.trigger<typeof codeEngineTask>(
      "code-engine",
      payload,
      {
        idempotencyKey: `code-exec-${currentProjectId}-${Date.now()}`,
        tags: [`project:${currentProjectId}`, `user:${userId}`],
      }
    );

    return res.status(202).json({
      success: true,
      projectId: currentProjectId,
      executionId: handle.id,
      status: "processing",
      message: "Code generation started. Check status endpoint for updates.",
    });
  } catch (error) {
    console.error("Error triggering code generation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start code generation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get execution status and results
 */
export const getExecutionStatusHandler = async (req: Request, res: Response) => {
  const { executionId } = req.params;
  const userId = req.userId!;

  try {
    const execution = await prisma.codeExecution.findUnique({
      where: { id: executionId! },
      include: {
        sandboxLogs: {
          orderBy: { timestamp: "asc" },
          take: 100, // Limit logs for performance
        },
        artifacts: {
          select: {
            id: true,
            filename: true,
            path: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
      },
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: "Execution not found",
      });
    }

    // Verify user has access
    if (execution.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to execution",
      });
    }

    // If completed, save assistant response to prompts
    if (execution.status === JobStatus.COMPLETED && execution.generatedCode) {
      const existingAssistantPrompt = await prisma.prompt.findFirst({
        where: {
          projectId: execution.projectId,
          role: "ASSISTANT",
          createdAt: {
            gte: execution.startedAt || execution.createdAt,
          },
        },
      });

      if (!existingAssistantPrompt) {
        await prisma.prompt.create({
          data: {
            content: execution.generatedCode,
            role: "ASSISTANT",
            projectId: execution.projectId,
            createdBy: userId,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      execution: {
        id: execution.id,
        projectId: execution.projectId,
        status: execution.status,
        sandboxId: execution.sandboxId,
        previewUrl: execution.previewUrl,
        generatedCode: execution.generatedCode,
        createdFiles: execution.createdFiles,
        stdout: execution.stdout,
        stderr: execution.stderr,
        error: execution.error,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        executionTimeMs: execution.executionTimeMs,
      },
      logs: execution.sandboxLogs,
      artifacts: execution.artifacts,
    });
  } catch (error) {
    console.error("Error fetching execution status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch execution status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get execution logs (streaming support)
 */
export const getExecutionLogsHandler = async (req: Request, res: Response) => {
  const { executionId } = req.params;
  const { after } = req.query; // Timestamp for pagination
  const userId = req.userId!;

  try {
    const execution = await prisma.codeExecution.findUnique({
      where: { id: executionId! },
      select: { userId: true },
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: "Execution not found",
      });
    }

    if (execution.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const logs = await prisma.sandboxLog.findMany({
      where: {
        executionId: executionId!,
        ...(after && {
          timestamp: {
            gt: new Date(after as string),
          },
        }),
      },
      orderBy: { timestamp: "asc" },
      take: 100,
    });

    return res.status(200).json({
      success: true,
      logs,
      hasMore: logs.length === 100,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get project executions
 */
export const getProjectExecutionsHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.userId!;

  try {
    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: projectId! },
      select: { userId: true },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const executions = await prisma.codeExecution.findMany({
      where: { projectId: projectId! },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        sandboxId: true,
        previewUrl: true,
        createdAt: true,
        completedAt: true,
        executionTimeMs: true,
        error: true,
      },
    });

    return res.status(200).json({
      success: true,
      executions,
    });
  } catch (error) {
    console.error("Error fetching project executions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch executions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Download artifact file
 */
export const downloadArtifactHandler = async (req: Request, res: Response) => {
  const { artifactId } = req.params;
  const userId = req.userId!;

  try {
    const artifact = await prisma.codeArtifact.findUnique({
      where: { id: artifactId! },
      include: {
        execution: {
          select: { userId: true },
        },
      },
    });

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: "Artifact not found",
      });
    }

    if (artifact.execution.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", artifact.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${artifact.filename}"`);
    res.setHeader("Content-Length", artifact.size);

    return res.send(artifact.content);
  } catch (error) {
    console.error("Error downloading artifact:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download artifact",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Cancel running execution
 */
export const cancelExecutionHandler = async (req: Request, res: Response) => {
  const { executionId } = req.params;
  const userId = req.userId!;

  try {
    const execution = await prisma.codeExecution.findUnique({
      where: { id: executionId! },
      select: { userId: true, status: true, triggerJobId: true },
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: "Execution not found",
      });
    }

    if (execution.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (!([JobStatus.PENDING, JobStatus.RUNNING, JobStatus.STREAMING, JobStatus.EXECUTING] as JobStatus[]).includes(execution.status)) {
      return res.status(400).json({
        success: false,
        message: "Execution cannot be cancelled in current state",
      });
    }

    // Cancel Trigger.dev job (if API available)
    // await tasks.cancel(execution.triggerJobId);

    // Update execution status
    await prisma.codeExecution.update({
      where: { id: executionId! },
      data: {
        status: JobStatus.CANCELLED,
        completedAt: new Date(),
        error: "Execution cancelled by user",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Execution cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling execution:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel execution",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Continue conversation on existing project
 */
export const continueConversationHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { message } = req.body;
  const userId = req.userId!;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  try {
    // Validate project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        prompts: {
          orderBy: { createdAt: "asc" },
        },
        executions: {
          where: { status: JobStatus.COMPLETED },
          orderBy: { conversationTurn: "desc" },
          take: 1,
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or unauthorized",
      });
    }

    // Get existing files from last execution
    const lastExecution = project.executions[0];
    const existingFiles = lastExecution?.createdFiles || [];
    const conversationTurn = (lastExecution?.conversationTurn || 0) + 1;

    // ✅ NEW: Fetch file contents - PRIORITIZE DATABASE OVER SANDBOX
    let fileContents: Array<{ path: string; content: string; size: number; truncated: boolean }> = [];

    if (lastExecution && existingFiles.length > 0) {
      console.log(`📂 Fetching file contents for conversation turn ${conversationTurn}`, {
        executionId: lastExecution.id,
        fileCount: existingFiles.length,
        files: existingFiles.slice(0, 5),
      });

      try {
        // ✅ STRATEGY 1: Get file contents from CodeArtifact table (most reliable)
        const artifacts = await prisma.codeArtifact.findMany({
          where: {
            executionId: lastExecution.id,
          },
          select: {
            path: true,
            content: true,
            size: true,
          },
        });

        if (artifacts.length > 0) {
          console.log(`✅ Found ${artifacts.length} files in database (CodeArtifact)`);

          // Convert artifacts to fileContents format
          fileContents = artifacts
            .filter(a => existingFiles.includes(a.path)) // Only include files that should exist
            .slice(0, 20) // Limit to 20 files
            .map(artifact => ({
              path: artifact.path,
              content: artifact.content,
              size: artifact.size,
              truncated: artifact.size > (50 * 1024), // Mark as truncated if > 50KB
            }));

          // Truncate large files
          fileContents = fileContents.map(file => {
            if (file.size > (50 * 1024)) {
              return {
                ...file,
                content: file.content.substring(0, 50 * 1024) +
                  `\n\n/* ... FILE TRUNCATED - Original size: ${(file.size / 1024).toFixed(2)}KB ... */`,
                size: 50 * 1024,
                truncated: true,
              };
            }
            return file;
          });

          // Enforce total size limit (200KB)
          let totalSize = 0;
          const maxTotalSize = 200 * 1024;
          fileContents = fileContents.filter(file => {
            if (totalSize + file.size <= maxTotalSize) {
              totalSize += file.size;
              return true;
            }
            return false;
          });

          console.log(`✅ Prepared ${fileContents.length} file contents from database`, {
            totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            truncatedFiles: fileContents.filter(f => f.truncated).length,
            filesIncluded: fileContents.map(f => `${f.path} (${(f.size / 1024).toFixed(2)}KB)`),
          });
        } else {
          console.log(`⚠️  No artifacts found in database, falling back to sandbox reading`);

          // ✅ STRATEGY 2: Fallback to sandbox reading (if database doesn't have files)
          if (project.activeSandboxId) {
            const { fetchFileContentsFromSandbox } = await import("../lib/utils.js");

            fileContents = await fetchFileContentsFromSandbox(
              project.activeSandboxId,
              existingFiles,
              {
                maxFileSize: 50 * 1024,
                maxTotalSize: 200 * 1024,
                maxFiles: 20,
              }
            );

            console.log(`${fileContents.length > 0 ? '✅' : '❌'} Fetched ${fileContents.length} files from sandbox`);
          }
        }

      } catch (fetchError) {
        console.error("❌ Failed to fetch file contents", {
          error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          stack: fetchError instanceof Error ? fetchError.stack : undefined,
        });
      }
    } else {
      console.log("⚠️  No previous execution or files to fetch", {
        hasLastExecution: !!lastExecution,
        fileCount: existingFiles.length,
      });
    }

    // Build conversation history (last 10 messages for context)
    const conversationHistory = project.prompts
      .slice(-10)
      .map((prompt: any) => ({
        role: prompt.role === PromptRole.USER ? ("user" as const) : ("assistant" as const),
        content: prompt.content,
      }));

    // Add new user message
    await prisma.prompt.create({
      data: {
        projectId: projectId,
        role: PromptRole.USER,
        content: message,
        createdBy: userId,
        metadata: {
          conversationTurn,
          timestamp: new Date().toISOString(),
        },
      },
    });

    conversationHistory.push({
      role: "user" as const,
      content: message,
    });

    // Trigger code execution with conversation context
    const payload = {
      projectId,
      userId,
      messages: conversationHistory,
      conversationTurn,
      parentExecutionId: lastExecution?.id,
      existingFiles,
      fileContents, // ✅ NEW: Include actual file contents for context
      sandboxConfig: {
        reuseSandbox: true,
        ...(project.activeSandboxId && { sandboxId: project.activeSandboxId }),
        template: (lastExecution?.sandboxTemplate as any) || "NODE_22",
        timeout: 3600000,
        keepAlive: true,
      },
    };

    const handle = await tasks.trigger<typeof codeEngineTask>(
      "code-engine",
      payload,
      {
        idempotencyKey: `continue-conversation-${projectId}-${conversationTurn}-${Date.now()}`,
        tags: [`project:${projectId}`, `user:${userId}`, `turn:${conversationTurn}`],
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        projectId,
        executionId: handle.id,
        jobId: handle.id,
        conversationTurn,
        message: "Processing your request...",
      },
    });
  } catch (error) {
    console.error("Error in continue conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process conversation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get conversation history for a project
 */
export const getConversationHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.userId!;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        prompts: {
          orderBy: { createdAt: "asc" },
          include: {
            execution: {
              select: {
                id: true,
                status: true,
                previewUrl: true,
                changedFiles: true,
                diffSummary: true,
              },
            },
          },
        },
        executions: {
          orderBy: { conversationTurn: "asc" },
          select: {
            id: true,
            status: true,
            conversationTurn: true,
            previewUrl: true,
            createdFiles: true,
            changedFiles: true,
            createdAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          previewUrl: project.previewUrl,
          activeSandboxId: project.activeSandboxId,
          conversationContext: project.conversationContext,
        },
        conversation: project.prompts.map((prompt: any) => ({
          id: prompt.id,
          role: prompt.role,
          content: prompt.content,
          createdAt: prompt.createdAt,
          metadata: prompt.metadata,
          execution: prompt.execution,
        })),
        executions: project.executions,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
    });
  }
};
