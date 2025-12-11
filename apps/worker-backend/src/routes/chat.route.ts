import { Router } from "express";
import { chatHandler, getChatHistoryHandler } from "../controllers/chat.controller.js";
import { authMiddleware } from "@repo/common/middleware";

const router = Router();

// Chat endpoint - handles AI conversation
router.post("/", authMiddleware, chatHandler);

// Get chat history for user
router.get("/history", authMiddleware, getChatHistoryHandler);

export default router;
