import express from "express";
import { authMiddleware } from "@repo/common";
import {
  deletePracticeDataHandler,
  getPracticeDataHandler,
  postPracticeDataHandler,
  updatePracticeStatusHandler,
} from "../controllers/practice.controller";

const router = express.Router();

router.get("/", authMiddleware, getPracticeDataHandler);
router.post("/create", authMiddleware, postPracticeDataHandler);
router.put("/:id/update", authMiddleware, updatePracticeStatusHandler);
router.delete("/:id/delete", authMiddleware, deletePracticeDataHandler);

export default router;
