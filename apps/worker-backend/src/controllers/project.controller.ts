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
        .slice(-5) // ✅ Only take last 5 messages for context
        .forEach((p) => {
          let content = p.content;

          // ✅ Truncate assistant messages to prevent token overflow
          if (p.role === PromptRole.ASSISTANT && content.length > 2000) {
            content = content.substring(0, 1000) +
              '\n\n[... AI response truncated for context ...]\n\n' +
              content.substring(content.length - 1000);
          }

          messages.push({
            role: p.role.toLowerCase() as "user" | "assistant",
            content,
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
        template: "NODE_22",
        timeout: 3600000, // 1 hour (was 300000 - fixed!)
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

    // ✅ CRITICAL FIX: Pre-create execution record to prevent 404 errors on immediate polling
    const createdExecution = await prisma.codeExecution.upsert({
      where: { id: handle.id },
      create: {
        id: handle.id,
        userId,
        projectId: currentProjectId,
        triggerJobId: handle.id,
        status: JobStatus.PENDING,
        aiModel: "github/gpt-4.1",
        sandboxTemplate: "NODE_22",
        conversationTurn: 1,
        parentExecutionId: null,
      },
      update: {
        // If already exists (from retry), reset to pending
        status: JobStatus.PENDING,
      },
    });

    console.log("✅ Execution record created", {
      executionId: createdExecution.id,
      projectId: currentProjectId,
      status: createdExecution.status,
    });

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
        // ✅ Generate a clean summary instead of raw XML
        const { generateExecutionSummary } = await import("../lib/utils.js");
        const summary = generateExecutionSummary(
          execution.generatedCode,
          execution.createdFiles,
          execution.conversationTurn || 1
        );

        await prisma.prompt.create({
          data: {
            content: summary, // ✅ Use clean summary instead of raw generatedCode
            role: "ASSISTANT",
            projectId: execution.projectId,
            createdBy: userId,
            metadata: {
              executionId: execution.id,
              filesCreated: execution.createdFiles.length,
              conversationTurn: execution.conversationTurn,
            },
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
 * Get file content by project and file path
 * This is more robust than fetching by execution ID
 */
export const getProjectFileHandler = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { filePath } = req.query;
  const userId = req.userId!;

  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({
      success: false,
      message: "File path is required",
    });
  }

  try {
    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId!,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Find the most recent artifact for this file path in this project
    // Join through executions to ensure we only get artifacts from this project
    const artifact = await prisma.codeArtifact.findFirst({
      where: {
        path: filePath,
        execution: {
          projectId: projectId!,
          status: JobStatus.COMPLETED, // Only get files from completed executions
        },
      },
      orderBy: {
        createdAt: "desc", // Get the most recent version
      },
      select: {
        id: true,
        filename: true,
        path: true,
        content: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    });

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: "File not found in project",
      });
    }

    // Return JSON with file data for frontend consumption
    return res.status(200).json({
      success: true,
      file: {
        id: artifact.id,
        filename: artifact.filename,
        path: artifact.path,
        content: artifact.content,
        mimeType: artifact.mimeType,
        size: artifact.size,
        createdAt: artifact.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching project file:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch file",
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
            .slice(0, 8) // ✅ CRITICAL FIX: Limit to 8 files max (was 20)
            .map(artifact => ({
              path: artifact.path,
              content: artifact.content,
              size: artifact.size,
              truncated: artifact.size > (10 * 1024), // ✅ CRITICAL FIX: Mark as truncated if > 10KB (was 50KB)
            }));

          // ✅ CRITICAL FIX: Truncate large files MORE AGGRESSIVELY
          fileContents = fileContents.map(file => {
            if (file.size > (10 * 1024)) {
              // For files > 10KB, take only first 5KB and last 5KB
              const maxSize = 10 * 1024;
              const half = maxSize / 2;
              return {
                ...file,
                content: file.content.substring(0, half) +
                  `\n\n/* ... FILE TRUNCATED (original: ${(file.size / 1024).toFixed(2)}KB) ... */\n\n` +
                  file.content.substring(file.content.length - half),
                size: maxSize,
                truncated: true,
              };
            }
            return file;
          });

          // ✅ CRITICAL FIX: Enforce MUCH stricter total size limit (30KB max for 8K token budget)
          // 30KB ~= 7,500 tokens, leaving room for system prompt (~2K) + conversation (~2K)
          let totalSize = 0;
          const maxTotalSize = 30 * 1024; // ✅ REDUCED from 200KB
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
            estimatedTokens: Math.ceil(totalSize / 4),
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
                maxFileSize: 10 * 1024,  // ✅ REDUCED from 50KB
                maxTotalSize: 30 * 1024, // ✅ REDUCED from 200KB
                maxFiles: 8,             // ✅ REDUCED from 20
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

    // Build conversation history (last 5 messages for context to save tokens)
    // ✅ CRITICAL FIX: Truncate assistant messages (generated code) to prevent token overflow
    const conversationHistory = project.prompts
      .slice(-5) // ✅ CRITICAL FIX: Reduced from 10 to 5 messages to fit 8K token limit
      .map((prompt: any) => {
        let content = prompt.content;

        // ✅ Truncate assistant messages (generatedCode) which can be massive
        if (prompt.role === PromptRole.ASSISTANT && content.length > 2000) {
          // Keep only first 1000 and last 1000 chars of assistant response
          content = content.substring(0, 1000) +
            '\n\n[... AI response truncated for context ...]\n\n' +
            content.substring(content.length - 1000);
        }

        return {
          role: prompt.role === PromptRole.USER ? ("user" as const) : ("assistant" as const),
          content,
        };
      });

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

    // ✅ CRITICAL: Check for in-progress executions to prevent multiple sandboxes
    const inProgressExecution = await prisma.codeExecution.findFirst({
      where: {
        projectId,
        status: {
          in: [JobStatus.PENDING, JobStatus.RUNNING, JobStatus.STREAMING, JobStatus.EXECUTING]
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      }
    });

    if (inProgressExecution) {
      console.warn("Execution already in progress, rejecting concurrent request", {
        projectId,
        existingExecutionId: inProgressExecution.id,
        status: inProgressExecution.status,
      });

      return res.status(409).json({
        success: false,
        message: "Another execution is already in progress. Please wait for it to complete.",
        executionId: inProgressExecution.id,
        status: inProgressExecution.status,
      });
    }

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

    // ✅ CRITICAL FIX: Pre-create execution record to prevent 404 errors on immediate polling
    const createdExecution = await prisma.codeExecution.upsert({
      where: { id: handle.id },
      create: {
        id: handle.id,
        userId,
        projectId,
        triggerJobId: handle.id,
        status: JobStatus.PENDING,
        aiModel: "github/gpt-4.1",
        sandboxTemplate: (lastExecution?.sandboxTemplate as any) || "NODE_22",
        conversationTurn,
        parentExecutionId: lastExecution?.id || null,
      },
      update: {
        // If already exists (from retry), keep it as is
        status: JobStatus.PENDING,
      },
    });

    console.log("✅ Conversation execution record created", {
      executionId: createdExecution.id,
      projectId,
      conversationTurn,
      status: createdExecution.status,
    });

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

/**
 * Get all projects for the authenticated user
 */
export const getAllProjectsHandler = async (req: Request, res: Response) => {
  const userId = req.userId!;

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    // Get last execution for each project
    const projectsWithLastExecution = await Promise.all(
      projects.map(async (project) => {
        const lastExecution = await prisma.codeExecution.findFirst({
          where: { projectId: project.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        });

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          lastExecution: lastExecution || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      projects: projectsWithLastExecution,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};
