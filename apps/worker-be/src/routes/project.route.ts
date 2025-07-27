import express from "express";
import { createProjectHandler } from "../controllers/project.controller";
import { authMiddleware } from "common/src/middleware";

const router = express.Router();

router.post("/create", authMiddleware, createProjectHandler);

export default router;
