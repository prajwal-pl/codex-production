import { groq } from "@ai-sdk/groq";
import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { streamText, type ModelMessage } from "ai";
import { getSystemPrompt } from "../lib/systemPrompt.js";
import { CodeExecutionPayloadSchema } from "../types/index.js";
import prisma from "@repo/db/client";
import { JobStatus } from "@repo/db/generated/prisma";

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
    try {
      const validated = CodeExecutionPayloadSchema.safeParse(payload);
      if (!validated.success) {
        logger.error("Invalid payload", { errors: validated.error.message });
        throw new Error("Invalid payload");
      }

      const { messages, projectId, userId, sandboxConfig } = validated.data;
      const jobId = ctx.batch?.id || ``;

      try {
        const execution = await prisma.codeExecution.create({
          data: {
            userId,
            projectId,
            triggerJobId: jobId,
            status: JobStatus.PENDING,
            aiModel: "openai/gpt-oss-120b",
            sandboxTemplate: sandboxConfig?.template || "NODE_22",
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
              await prisma.sandboxLog.create({
                data: {
                  executionId: execution.id,
                  type: "ai-stream",
                  content: chunk.chunk.text
                }
              });
            }
          }
        });

      } catch (error) {

      }

      const response = await streamText({
        model: groq("openai/gpt-oss-120b"),
        messages: [payload],
        system: getSystemPrompt(),
        onChunk: (chunk) => {
          logger.log("Received chunk", { chunk });
        }
      })

      let fullResponse = "";
      for await (const chunk of response.textStream) {
        fullResponse += chunk;
      }

      if (!fullResponse || fullResponse.trim() === "") {
        throw new Error("No response from model");
      }

      logger.log("Full response received", { fullResponse });



    } catch (error) {
      console.log(error)
      logger.error("Error in code engine task", { error });
    }
  }
})