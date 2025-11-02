import express from "express";
import { authMiddleware } from "@repo/common/middleware";
import {
    executeCodeHandler,
    submitCodeHandler,
    getSubmissionsByProblemHandler,
    getSubmissionByIdHandler,
    getAllSubmissionsHandler,
    getRuntimesHandler,
} from "../controllers/submission.controller.js";

const router = express.Router();

// Code execution routes
router.post("/execute", authMiddleware, executeCodeHandler);
router.post("/submit", authMiddleware, submitCodeHandler);

// Submission history routes
router.get("/", authMiddleware, getAllSubmissionsHandler);
router.get("/:id", authMiddleware, getSubmissionByIdHandler);
router.get("/problem/:problemId", authMiddleware, getSubmissionsByProblemHandler);

// Piston runtimes
router.get("/runtimes/list", getRuntimesHandler);

export default router;
