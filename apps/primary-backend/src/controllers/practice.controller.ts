import { type Request, type Response } from "express";
import prisma from "@repo/db/client";

export const getPracticeDataHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const practiceData = await prisma.dSAResult.findMany({
      where: {
        userId,
      },
    });

    if (!practiceData || practiceData.length === 0) {
      return res.status(404).json({ message: "No practice data found" });
    }

    return res.status(200).json({
      message: "Practice data retrieved successfully",
      data: practiceData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const postPracticeDataHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { code, language, output } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!code || !language || !output) {
      return res
        .status(400)
        .json({ message: "Code, language, and output are required." });
    }
    const newPracticeData = await prisma.dSAResult.create({
      data: {
        userId,
        code,
        language,
        output,
      },
    });

    return res.status(201).json({
      message: "Practice data saved successfully",
      data: newPracticeData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePracticeStatusHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id || !status) {
      return res.status(400).json({ message: "ID and status are required." });
    }

    const updatedPracticeData = await prisma.dSAResult.update({
      where: { id, userId },
      data: { status },
    });

    return res.status(200).json({
      message: "Practice status updated successfully",
      data: updatedPracticeData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deletePracticeDataHandler = async (
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
      return res.status(400).json({ message: "ID is required." });
    }

    await prisma.dSAResult.delete({
      where: { id, userId },
    });

    return res.status(200).json({
      message: "Practice data deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
