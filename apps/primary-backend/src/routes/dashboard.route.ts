import { Router } from "express";
import { authMiddleware } from "@repo/common/middleware";
import {
    getDashboardStatsHandler,
    getRecentProjectsHandler,
} from "../controllers/dashboard.controller.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/dashboard/stats - Get dashboard statistics
router.get("/stats", getDashboardStatsHandler);

// GET /api/dashboard/recent-projects - Get recent projects with status
router.get("/recent-projects", getRecentProjectsHandler);

export default router;
