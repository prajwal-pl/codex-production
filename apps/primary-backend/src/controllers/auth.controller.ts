import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import prisma from "@repo/db/client";
import { getGoogleAuthUrl, oauth2Client } from "../lib/oauth.js";

export const registerHandler = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists! Please login." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        name: name,
      },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token: token,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash!);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const googleAuthHandler = async (req: Request, res: Response) => {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const googleCallbackHandler = async (req: Request, res: Response) => {
  try {
    console.log("Callback url hit with data:", req.query);
    const { code } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required." });
    }

    const { tokens } = await oauth2Client.getToken(code as string);
    const idToken = tokens.id_token;

    console.log("Google Id Token:", idToken);

    if (!idToken)
      return res.status(400).json({ message: "Id Token not found" });

    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();

    console.log("Google OAuth Payload:", payload);

    const name = payload?.name || payload?.given_name || "Google User";
    const email = payload?.email || "No email provided";
    const googleId = payload?.sub || "No Google ID provided";

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        email,
        passwordHash: `gid_${googleId}`,
      },
      create: {
        name,
        email,
        passwordHash: `gid_${googleId}`,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    const url = new URL("/auth/callback", frontend);
    url.searchParams.set("token", token);
    res.redirect(302, url.toString());
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    const url = new URL("/auth/login", frontend);
    url.searchParams.set("oauth", "failed");
    return res.redirect(302, url.toString());
  }
};
