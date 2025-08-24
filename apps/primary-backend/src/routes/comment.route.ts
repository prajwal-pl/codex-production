import express from "express";
import { authMiddleware } from "@repo/common/middleware";
import {
  deleteCommentHandler,
  getAllCommentsHandler,
  postCommentHandler,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:id", authMiddleware, getAllCommentsHandler);
router.post("/:id", authMiddleware, postCommentHandler);
router.delete("/:id", authMiddleware, deleteCommentHandler);

export default router;
