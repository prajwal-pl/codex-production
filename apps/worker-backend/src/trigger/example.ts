import { groq } from "@ai-sdk/groq";
import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { streamText, type ModelMessage } from "ai";
import { getSystemPrompt } from "../lib/systemPrompt.js";
import { CodeExecutionPayloadSchema } from "../types/index.js";
import prisma from "@repo/db/client";
import { JobStatus } from "@repo/db/generated/prisma";
import { executeArtifact, parseArtifact } from "../lib/utils.js";
import { Sandbox } from "@e2b/code-interpreter";

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
  maxDuration: 900, // Stop executing after 900 secs (15 mins) of compute
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
      logger.error("Invalid payload", { errors: validated.error.message });
      throw new Error("Invalid payload");
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
          aiModel: "openai/gpt-oss-120b",
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

      const response = await streamText({
        model: groq("openai/gpt-oss-120b"),
        messages: messages as ModelMessage[],
        system: getSystemPrompt(),
        onChunk: async (chunk) => {
          logger.log("Received chunk", { chunk });
          if (chunk.chunk.type === 'text-delta') {
            logger.log("Text delta", { text: chunk.chunk.text });
            // await prisma.sandboxLog.create({
            //   data: {
            //     executionId: execution.id,
            //     type: "ai-stream",
            //     content: chunk.chunk.text
            //   }
            // });
          }
        }
      });

      const usage = await response.usage

      let fullResponse = "";
      for await (const chunk of response.textStream) {
        fullResponse += chunk;
      }

      await prisma.codeExecution.update({
        where: { id: execution.id },
        data: {
          status: JobStatus.EXECUTING,
          generatedCode: fullResponse,
          promptTokens: usage?.inputTokens || 0,
          completionTokens: usage?.totalTokens || 0,
        }
      })

      logger.info("AI response received", { executionId: execution.id, responseLength: fullResponse.length });

      const actions = parseArtifact(fullResponse);

      if (actions.length === 0) {
        throw new Error("No actions to execute");
      }

      // await prisma.sandboxLog.create({
      //   data: {
      //     executionId: execution.id,
      //     type: "system",
      //     content: `Parsed ${actions.length} actions from AI response.`,
      //   }
      // })

      const sandbox = await Sandbox.create({
        apiKey: process.env.E2B_API_KEY!,
        timeoutMs: 3600000, // 1 hour timeout
      })

      const sandboxId = sandbox.sandboxId

      logger.info("Sandbox created", { sandboxId });

      await prisma.sandboxLog.create({
        data: {
          executionId: execution.id,
          type: "system",
          content: `E2B Sandbox created: ${sandboxId}`,
        }
      })

      logger.info("Executing artifact in sandbox...");

      const executionResult = await executeArtifact(sandbox, actions, execution.id);

      logger.info("Artifact executed", {
        filesCreated: executionResult.createdFiles.length,
        commandsExecuted: executionResult.executedCommands.length,
        errors: executionResult.errors.length
      });

      // ✅ Wait for dev server to fully start (30 seconds)
      logger.info("Waiting for dev server to fully initialize...");
      await wait.for({ seconds: 30 });

      // ✅ CRITICAL FIX: Detect the actual port the dev server is using
      const { detectDevServerPort } = await import("../lib/utils.js");
      const detectedPort = await detectDevServerPort(sandbox, execution.id);

      if (!detectedPort) {
        logger.error("Could not detect dev server port");

        await prisma.sandboxLog.create({
          data: {
            executionId: execution.id,
            type: "stderr",
            content: "Failed to detect dev server port. The application may not have started correctly.",
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