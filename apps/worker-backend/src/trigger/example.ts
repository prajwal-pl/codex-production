import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { type ModelMessage } from "ai";
import { getSystemPrompt } from "../lib/systemPrompt.js";
import { CodeExecutionPayloadSchema } from "../types/index.js";
import prisma from "@repo/db/client";
import { JobStatus } from "@repo/db/generated/prisma";
import { executeArtifact, parseArtifact } from "../lib/utils.js";
import { Sandbox } from "@e2b/code-interpreter";
import { generateWithGitHubModels, GITHUB_MODELS, type GitHubModelsMessage } from "../lib/github-models-provider.js";

// export const helloWorldTask = task({
//   id: "hello-world",
//   // Set an optional maxDuration to prevent tasks from running indefinitely
//   maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
//   run: async (payload: any, { ctx }) => {
//     logger.log("Hello, world!", { payload, ctx });

//     await wait.for({ seconds: 5 });

//     return {
//       message: "Hello, world!",
//     }
//   },
// });

export const codeEngineTask = task({
  id: "code-engine",
  maxDuration: 1800, // Stop executing after 1800 secs (30 mins) of compute - increased for conversation iterations
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: any, { ctx }) => {
    logger.log("Code engine task running", { payload, ctx });
    const validated = CodeExecutionPayloadSchema.safeParse(payload);
    if (!validated.success) {
      logger.error("Invalid payload", {
        errors: validated.error.issues,
        payload: JSON.stringify(payload, null, 2)
      });
      throw new Error(`Invalid payload: ${validated.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }

    const { messages, projectId, userId, sandboxConfig } = validated.data;
    const jobId = ctx.run.id

    try {
      // Use upsert to handle retries gracefully
      const execution = await prisma.codeExecution.upsert({
        where: { id: jobId },
        create: {
          id: jobId,
          userId,
          projectId,
          triggerJobId: jobId,
          status: JobStatus.PENDING,
          aiModel: "github/openai/gpt-4.1",
          sandboxTemplate: sandboxConfig?.template || "NODE_22",
        },
        update: {
          // On retry, reset to pending state
          status: JobStatus.PENDING,
          error: null,
        },
      });

      await prisma.codeExecution.update({
        where: { id: execution.id },
        data: {
          status: JobStatus.STREAMING,
          startedAt: new Date()
        },
      });

      logger.info("🤖 Generating code with GitHub Models API (GPT-4.1)...");

      // ✅ Build conversation context for system prompt
      const conversationContext = validated.data.conversationTurn > 1 ? {
        conversationTurn: validated.data.conversationTurn,
        existingFiles: validated.data.existingFiles || [],
        fileContents: validated.data.fileContents || [], // ✅ NEW: Pass file contents to system prompt
      } : undefined;

      logger.info("Conversation context", {
        turn: validated.data.conversationTurn,
        existingFiles: validated.data.existingFiles?.length || 0,
        fileContents: validated.data.fileContents?.length || 0,
        totalFileSize: validated.data.fileContents?.reduce((sum, f) => sum + (f.size || 0), 0) || 0,
      });

      // Convert ModelMessage[] to GitHubModelsMessage[]
      const githubMessages: GitHubModelsMessage[] = [
        { role: "system", content: getSystemPrompt(conversationContext as any) }, // ✅ Pass conversation context
        ...(messages as ModelMessage[]).map(m => ({
          role: m.role as "user" | "assistant",
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        }))
      ];

      // Generate with GitHub Models API
      const result = await generateWithGitHubModels(githubMessages, {
        model: GITHUB_MODELS.GPT_4_1,
        temperature: 0.7,
        maxTokens: 8192, // GPT-4.1 supports larger context
        topP: 1.0,
      });

      const fullResponse = result.content;
      const promptTokens = result.promptTokens;
      const completionTokens = result.completionTokens;

      logger.info("✅ GitHub Models generation complete", {
        responseLength: fullResponse.length,
        promptTokens,
        completionTokens,
        totalTokens: result.totalTokens,
      });

      await prisma.codeExecution.update({
        where: { id: execution.id },
        data: {
          status: JobStatus.EXECUTING,
          generatedCode: fullResponse,
          promptTokens: promptTokens,
          completionTokens: completionTokens,
        }
      })

      logger.info("AI response received", { executionId: execution.id, responseLength: fullResponse.length });

      const actions = parseArtifact(fullResponse);

      if (actions.length === 0) {
        throw new Error("No actions to execute");
      }

      // ✅ Check if we should reuse an existing sandbox or create a new one
      let sandbox: Sandbox;
      let sandboxId: string;
      const shouldReuseSandbox = sandboxConfig?.reuseSandbox && sandboxConfig?.sandboxId;

      if (shouldReuseSandbox) {
        // ✅ RECONNECT to existing sandbox
        logger.info("Reconnecting to existing sandbox", {
          sandboxId: sandboxConfig.sandboxId,
          conversationTurn: validated.data.conversationTurn
        });

        try {
          sandbox = await Sandbox.connect(sandboxConfig.sandboxId!);
          sandboxId = sandbox.sandboxId;

          logger.info("Successfully reconnected to sandbox", { sandboxId });

          await prisma.sandboxLog.create({
            data: {
              executionId: execution.id,
              type: "system",
              content: `♻️ Reconnected to existing E2B Sandbox: ${sandboxId} (conversation turn ${validated.data.conversationTurn})`,
            }
          });
        } catch (reconnectError) {
          logger.warn("Failed to reconnect to sandbox, creating new one", {
            error: reconnectError instanceof Error ? reconnectError.message : 'Unknown error',
            sandboxId: sandboxConfig.sandboxId
          });

          await prisma.sandboxLog.create({
            data: {
              executionId: execution.id,
              type: "stderr",
              content: `⚠️ Could not reconnect to sandbox ${sandboxConfig.sandboxId}, creating a new one. Error: ${reconnectError instanceof Error ? reconnectError.message : 'Unknown error'}`,
            }
          });

          // Fallback: create new sandbox
          sandbox = await Sandbox.create({
            apiKey: process.env.E2B_API_KEY!,
            timeoutMs: sandboxConfig?.timeout || 3600000,
          });
          sandboxId = sandbox.sandboxId;

          await prisma.sandboxLog.create({
            data: {
              executionId: execution.id,
              type: "system",
              content: `🆕 Created new E2B Sandbox: ${sandboxId} (fallback)`,
            }
          });
        }
      } else {
        // ✅ CREATE new sandbox
        logger.info("Creating new sandbox", {
          conversationTurn: validated.data.conversationTurn
        });

        sandbox = await Sandbox.create({
          apiKey: process.env.E2B_API_KEY!,
          timeoutMs: sandboxConfig?.timeout || 3600000,
        });

        sandboxId = sandbox.sandboxId;

        logger.info("Sandbox created", { sandboxId });

        await prisma.sandboxLog.create({
          data: {
            executionId: execution.id,
            type: "system",
            content: `🆕 Created new E2B Sandbox: ${sandboxId}`,
          }
        });
      }

      logger.info("Executing artifact in sandbox...");

      const executionResult = await executeArtifact(sandbox, actions, execution.id);

      logger.info("Artifact executed", {
        filesCreated: executionResult.createdFiles.length,
        commandsExecuted: executionResult.executedCommands.length,
        errors: executionResult.errors.length
      });

      // ✅ Wait for dev server to fully start (30 seconds initially)
      logger.info("Waiting for dev server to fully initialize...");
      await wait.for({ seconds: 30 });

      // ✅ Check if dev server process is still running
      try {
        const processCheck = await sandbox.commands.run("ps aux | grep -E '(node|npm|yarn|pnpm)' | grep -v grep || echo 'no processes'");
        await prisma.sandboxLog.create({
          data: {
            executionId: execution.id,
            type: "system",
            content: `Active Node processes:\n${processCheck.stdout}`,
          },
        });
      } catch (error) {
        logger.warn("Could not check running processes", { error });
      }

      // ✅ CRITICAL FIX: Detect the actual port the dev server is using
      const { detectDevServerPort } = await import("../lib/utils.js");
      let detectedPort = await detectDevServerPort(sandbox, execution.id);

      // ✅ If no port detected, wait a bit longer and try again (dev server might be slow to start)
      if (!detectedPort) {
        logger.warn("Port not detected on first attempt, waiting additional 15 seconds...");

        await prisma.sandboxLog.create({
          data: {
            executionId: execution.id,
            type: "system",
            content: "⚠️ Port not detected on first attempt, waiting additional 15 seconds for dev server to start...",
          },
        });

        await wait.for({ seconds: 15 });
        detectedPort = await detectDevServerPort(sandbox, execution.id);
      }

      if (!detectedPort) {
        logger.error("Could not detect dev server port after multiple attempts");

        // Capture final dev server logs for debugging
        try {
          const finalLogs = await sandbox.commands.run("cat /tmp/dev-server.log 2>/dev/null | tail -100 || echo 'No logs available'");
          await prisma.sandboxLog.create({
            data: {
              executionId: execution.id,
              type: "stderr",
              content: `❌ Final dev server logs:\n${finalLogs.stdout}`,
            },
          });
        } catch (error) {
          logger.warn("Could not capture final logs", { error });
        }

        await prisma.sandboxLog.create({
          data: {
            executionId: execution.id,
            type: "stderr",
            content: "❌ Failed to detect dev server port after waiting 45 seconds. The application may have failed to start. Check the dev server logs above for errors.",
          },
        });

        throw new Error("Dev server port detection failed. Check sandbox logs for details.");
      }

      logger.info(`Dev server detected on port ${detectedPort}`);

      // ✅ Use the detected port for the URL
      const sandboxHost = sandbox.getHost(detectedPort);
      const devServerUrl = `https://${sandboxHost}`;

      logger.info("Dev server URL generated", {
        detectedPort,
        sandboxHost,
        devServerUrl,
        sandboxId
      });

      // ✅ Verify dev server is responding on detected port
      try {
        const serverCheck = await sandbox.commands.run(
          `curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://localhost:${detectedPort} || echo 'timeout'`
        );

        logger.info(`Port ${detectedPort} HTTP check`, {
          response: serverCheck.stdout,
          exitCode: serverCheck.exitCode
        });

        if (serverCheck.stdout.includes('200') || serverCheck.stdout.includes('304') || serverCheck.stdout.includes('301')) {
          logger.info(`✅ Dev server responding successfully on port ${detectedPort}`);

          await prisma.sandboxLog.create({
            data: {
              executionId: execution.id,
              type: "system",
              content: `✅ Dev server is accessible at ${devServerUrl} (port ${detectedPort})`,
            },
          });
        } else {
          logger.warn(`⚠️ Dev server not responding on port ${detectedPort}`, {
            response: serverCheck.stdout
          });
        }
      } catch (checkError) {
        logger.warn("Could not verify dev server status", {
          error: checkError instanceof Error ? checkError.message : 'Unknown error'
        });
      }

      // In example.ts, line 148
      await prisma.codeExecution.update({
        where: { id: execution.id },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          previewUrl: devServerUrl,
          // ✅ FIX: Map to string array
          createdFiles: executionResult.createdFiles.map(f =>
            typeof f === 'string' ? f : f.path
          ),
          exitCode: executionResult.errors.length === 0 ? 0 : 1,
          sandboxId
        }
      });

      // ✅ Update project with active sandbox ID for future conversation turns
      await prisma.project.update({
        where: { id: projectId },
        data: {
          activeSandboxId: sandboxId,
          currentExecutionId: execution.id,
        }
      });

      logger.info("Updated project with sandbox info", {
        projectId,
        sandboxId,
        executionId: execution.id
      });

      const startTime = (await sandbox.getInfo()).startedAt;
      const endTime = (await sandbox.getInfo()).endAt;

      const executionTimeMs = endTime && startTime ? Number(endTime) - Number(startTime) : 0;

      await prisma.sandboxUsage.create({
        data: {
          userId,
          sandboxTemplate: sandboxConfig?.template || "NODE_22",
          memoryUsedMb: (await sandbox.getInfo()).memoryMB,
          cpuTimeMs: (await sandbox.getInfo()).cpuCount,
          cost: 0.01,
          executionTimeMs: executionTimeMs,
        }
      })

      logger.info("Code execution completed", { executionId: execution.id, sandboxId, devServerUrl, createdFiles: executionResult.createdFiles, errors: executionResult.errors });

      return {
        success: true,
        executionId: execution.id,
        filesCreated: executionResult.createdFiles.length,
        commandsExecuted: executionResult.executedCommands.length,
        errors: executionResult.errors.length,
        previewUrl: devServerUrl,
      }

    } catch (error) {
      logger.error("Error during code execution process", { error });

      await prisma.codeExecution.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          error: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }
})