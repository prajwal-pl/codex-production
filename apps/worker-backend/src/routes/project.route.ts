import express from "express";
import { createProjectHandler } from "../controllers/project.controller.js";
import { authMiddleware } from "@repo/common/middleware";

const router = express.Router();

router.post("/create", authMiddleware, createProjectHandler);

export default router;
