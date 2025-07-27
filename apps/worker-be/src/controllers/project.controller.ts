import { Request, Response } from "express";
import { CoreMessage, streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import prisma from "db/index";
import { getSystemPrompt } from "../lib/systemPrompt";

export const createProjectHandler = async (req: Request, res: Response) => {
  const { prompt, projectId } = req.body;
  try {
    const messages: CoreMessage[] = [];

    if (projectId) {
      const existingPrompts = await prisma.prompt.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" },
      });

      existingPrompts.forEach((p) => {
        messages.push({
          role: p.role.toLowerCase() as "user" | "assistant",
          content: p.content,
        });
      });
    }

    messages.push(
      {
        role: "system",
        content: getSystemPrompt(),
      },
      {
        role: "user",
        content: prompt,
      }
    );

    const response = streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages,
    });

    let fullResponse = "";
    for await (const chunk of response.textStream) {
      fullResponse += chunk;
      console.log(chunk);
    }

    console.log(fullResponse);

    let currentProjectId;

    if (!projectId) {
      const newProject = await prisma.project.create({
        data: {
          title: "New Project",
          description: "Automatically created project",
          content: fullResponse,
          userId: req.user.id,
        },
      });

      currentProjectId = newProject.id;

      const promptData = await prisma.prompt.createMany({
        data: [
          {
            content: fullResponse,
            role: "ASSISTANT",
            projectId: currentProjectId,
            createdBy: req.user.id,
          },
          {
            content: prompt,
            role: "USER",
            projectId: currentProjectId,
            createdBy: req.user.id,
          },
        ],
        skipDuplicates: true,
      });

      res.status(201).json({
        projectId: currentProjectId,
        message: "Project created successfully",
        content: fullResponse,
      });
    }

    await prisma.project.update({
      where: {
        id: projectId,
        userId: req.user.id,
      },
      data: {
        content: fullResponse,
      },
    });

    await prisma.prompt.createMany({
      data: [
        {
          content: fullResponse,
          role: "ASSISTANT",
          projectId: projectId,
          createdBy: req.user.id,
        },
        {
          content: prompt,
          role: "USER",
          projectId: projectId,
          createdBy: req.user.id,
        },
      ],
      skipDuplicates: true,
    });

    res.status(200).json({
      projectId: projectId,
      message: "Project retrieved successfully",
      content: fullResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
