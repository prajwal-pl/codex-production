import express from "express";
import {
  googleCallbackHandler,
  googleOAuthHandler,
  loginHandler,
  registerHandler,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);

router.get("/google/oauth", googleOAuthHandler);
router.get("/google/callback", googleCallbackHandler);

export default router;
