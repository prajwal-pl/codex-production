import { type Request, type Response } from "express";
import prisma from "@repo/db/client";

export const getAllPostsDataHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const posts = await prisma.post.findMany({
      where: {
        isFlagged: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPostByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const postId = req.params.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
        isFlagged: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createPostHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { title, content } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { title, content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id || !title || !content) {
      return res
        .status(400)
        .json({ message: "Post ID, title, and content are required" });
    }

    const isPostOwner = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!isPostOwner || isPostOwner.authorId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post" });
    }

    const post = await prisma.post.update({
      where: { id, authorId: userId },
      data: { title, content },
    });

    return res.status(200).json({
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deletePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const isPostOwner = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!isPostOwner || isPostOwner.authorId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.post.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const flagPostHandler = async (req: Request, res: Response) => { };
