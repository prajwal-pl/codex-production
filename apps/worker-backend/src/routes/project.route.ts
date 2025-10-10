import express from "express";
import { authMiddleware } from "@repo/common/middleware";
import {
    createProjectHandler,
    getExecutionStatusHandler,
    getExecutionLogsHandler,
    getProjectExecutionsHandler,
    downloadArtifactHandler,
    cancelExecutionHandler,
} from "../controllers/project.controller.js";

const router = express.Router();

// Create/update project and trigger code generation
router.post("/create", authMiddleware, createProjectHandler);

// Get execution status and results
router.get("/execution/:executionId", authMiddleware, getExecutionStatusHandler);

// Get execution logs (supports pagination)
router.get("/execution/:executionId/logs", authMiddleware, getExecutionLogsHandler);

// Get all executions for a project
router.get("/:projectId/executions", authMiddleware, getProjectExecutionsHandler);

// Download artifact file
router.get("/artifact/:artifactId/download", authMiddleware, downloadArtifactHandler);

// Cancel running execution
router.post("/execution/:executionId/cancel", authMiddleware, cancelExecutionHandler);

export default router;
