import { type Request, type Response } from "express";
import prisma from "@repo/db/client";

export const getUserProfileHandler = async (req: Request, res: Response) => {
  const userId = req.userId!;
  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, bio, linkedinUrl, resumeUrl, githubUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        bio,
        linkedinUrl,
        resumeUrl,
        githubUrl,
      },
    });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteProfileHandler = async (req: Request, res: Response) => {
  const userId = req.userId!;
  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res
      .status(200)
      .json({ message: "Profile deleted successfully", user: deletedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
