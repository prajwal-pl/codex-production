import { type Request, type Response } from "express";
import prisma from "@repo/db/client";

export const getAllCommentsHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!id) {
      return res.status(400).json({ message: "Post ID is required." });
    }

    const comments = await prisma.post.findMany({
      where: {
        id,
      },
      select: {
        comments: true,
      },
    });

    if (!comments || comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this post." });
    }

    return res.status(200).json({
      message: "Comments retrieved successfully",
      data: comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const postCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Post ID is required." });
    }

    if (!content) {
      return res.status(400).json({ message: "Comment content is required." });
    }

    const newComment = await prisma.post.update({
      where: {
        id,
      },
      data: {
        comments: {
          create: {
            content,
            authorId: userId,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Comment posted successfully",
      data: newComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Comment ID is required." });
    }

    const authorCheck = await prisma.comment.findUnique({
      where: {
        id,
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (
      !authorCheck ||
      authorCheck.post.authorId !== userId ||
      authorCheck.authorId !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    const deletedComment = await prisma.comment.deleteMany({
      where: {
        id,
        authorId: userId,
      },
    });

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
