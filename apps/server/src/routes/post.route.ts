import express from "express";
import { authMiddleware } from "@repo/common";
import {
  createPostHandler,
  deletePostHandler,
  flagPostHandler,
  getAllPostsDataHandler,
  getPostByIdHandler,
} from "../controllers/post.controller";

const router = express.Router();

router.get("/", authMiddleware, getAllPostsDataHandler);
router.post("/", authMiddleware, createPostHandler);
router.get("/:id", authMiddleware, getPostByIdHandler);
router.delete("/:id", authMiddleware, deletePostHandler);
router.post("/:id/flag", authMiddleware, flagPostHandler);

export default router;
