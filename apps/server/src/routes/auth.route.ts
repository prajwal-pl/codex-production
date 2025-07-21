import express from "express";
import { loginHandler, registerHandler } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);

export default router;
