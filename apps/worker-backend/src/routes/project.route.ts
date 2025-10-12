import express from "express";
import { authMiddleware } from "@repo/common/middleware";
import {
    createProjectHandler,
    getExecutionStatusHandler,
    getExecutionLogsHandler,
    getProjectExecutionsHandler,
    downloadArtifactHandler,
    getProjectFileHandler,
    cancelExecutionHandler,
    continueConversationHandler,
    getConversationHandler,
    getAllProjectsHandler,
} from "../controllers/project.controller.js";

const router = express.Router();

// Get all projects for the authenticated user
router.get("/", authMiddleware, getAllProjectsHandler);

// Create/update project and trigger code generation
router.post("/create", authMiddleware, createProjectHandler);

// Continue existing conversation for a project
router.post("/:projectId/conversation", authMiddleware, continueConversationHandler);

// Get conversation history for a project
router.get("/:projectId/conversation", authMiddleware, getConversationHandler);

// Get execution status and results
router.get("/execution/:executionId", authMiddleware, getExecutionStatusHandler);

// Get execution logs (supports pagination)
router.get("/execution/:executionId/logs", authMiddleware, getExecutionLogsHandler);

// Get all executions for a project
router.get("/:projectId/executions", authMiddleware, getProjectExecutionsHandler);

// Download artifact file
router.get("/artifact/:artifactId/download", authMiddleware, downloadArtifactHandler);

// Get file content by project and file path (more robust)
router.get("/:projectId/file", authMiddleware, getProjectFileHandler);

// Cancel running execution
router.post("/execution/:executionId/cancel", authMiddleware, cancelExecutionHandler);

export default router;
