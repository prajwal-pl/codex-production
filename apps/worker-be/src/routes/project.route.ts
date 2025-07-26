import express from "express";
import { createProjectHandler } from "../controllers/project.controller";

const router = express.Router();

router.post("/create", createProjectHandler);

export default router;
