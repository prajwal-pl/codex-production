import { type Request, type Response } from "express";
import { type CoreMessage, streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import prisma from "@repo/db/client";
import { getSystemPrompt } from "../lib/systemPrompt.js";

export const createProjectHandler = async (req: Request, res: Response) => {
  const { prompt, projectId } = req.body;
  try {
    const messages: CoreMessage[] = [];

    if (projectId) {
      const existingPrompts = await prisma.prompt.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" },
      });

      existingPrompts &&
        existingPrompts
          .filter((p) => p.content && p.content.trim() !== "")
          .forEach((p) => {
            messages.push({
              role: p.role.toLowerCase() as "user" | "assistant",
              content: p.content,
            });
          });
    }

    messages.push(
      // {
      //   role: "system",
      //   content: getSystemPrompt(),
      // },
      {
        role: "user",
        content: prompt,
      }
    );

    console.log("Final messages array:");
    messages.forEach((msg, i) => {
      const contentPreview =
        typeof msg.content === "string"
          ? msg.content.substring(0, 100)
          : JSON.stringify(msg.content).substring(0, 100);
      console.log(`${i}: ${msg.role} - ${contentPreview}...`);
    });

    const response = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages,
      system: getSystemPrompt(),
    });

    let fullResponse = "";
    for await (const chunk of response.textStream) {
      fullResponse += chunk;
    }

    if (!fullResponse || fullResponse.trim() === "") {
      console.log("WARNING: fullResponse is empty!");
      return res.status(500).json({
        message: "AI response was empty",
        debug: { prompt, messages },
      });
    }

    let currentProjectId;

    if (!projectId) {
      const newProject = await prisma.project.create({
        data: {
          title: "New Project",
          description: "Automatically created project",
          content: fullResponse,
          userId: req.userId!,
        },
      });

      currentProjectId = newProject.id;

      await prisma.prompt.create({
        data: {
          content: prompt,
          role: "USER",
          projectId: currentProjectId,
          createdBy: req.userId!,
        },
      });
      await prisma.prompt.create({
        data: {
          content: fullResponse,
          role: "ASSISTANT",
          projectId: currentProjectId,
          createdBy: req.userId!,
        },
      });

      return res.status(201).json({
        projectId: currentProjectId,
        message: "Project created successfully",
        content: fullResponse,
      });
    }

    await prisma.project.update({
      where: {
        id: projectId,
        userId: req.userId!,
      },
      data: {
        content: fullResponse,
      },
    });

    await prisma.prompt.create({
      data: {
        content: prompt,
        role: "USER",
        projectId: projectId,
        createdBy: req.userId!,
      },
    });
    await prisma.prompt.create({
      data: {
        content: fullResponse,
        role: "ASSISTANT",
        projectId: projectId,
        createdBy: req.userId!,
      },
    });

    return res.status(200).json({
      projectId: projectId,
      message: "Project retrieved successfully",
      content: fullResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
