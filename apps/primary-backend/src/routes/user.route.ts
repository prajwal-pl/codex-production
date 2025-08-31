import express from "express";
import { authMiddleware } from "@repo/common/middleware";
import {
  deleteProfileHandler,
  getUserProfileHandler,
  updateProfileHandler,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getUserProfileHandler);
router.put("/update", authMiddleware, updateProfileHandler);
router.delete("/delete", authMiddleware, deleteProfileHandler);

export default router;
