import express from "express";
import { authMiddleware } from "@repo/common/middleware";
import {
    getAllProblemsHandler,
    getProblemBySlugHandler,
    createProblemHandler,
    updateProblemHandler,
    deleteProblemHandler,
    getPracticeStatsHandler,
} from "../controllers/problem.controller.js";

const router = express.Router();

// Public routes (with optional auth for solved status)
router.get("/", authMiddleware, getAllProblemsHandler);
router.get("/stats", authMiddleware, getPracticeStatsHandler);
router.get("/:slug", authMiddleware, getProblemBySlugHandler);

// Admin routes (add admin middleware as needed)
router.post("/", authMiddleware, createProblemHandler);
router.put("/:slug", authMiddleware, updateProblemHandler);
router.delete("/:slug", authMiddleware, deleteProblemHandler);

export default router;
