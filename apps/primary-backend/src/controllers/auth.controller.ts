import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import prisma from "@repo/db/client";

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

export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    const some_state = "some_state";
    const GOOGLE_OAUTH_SCOPES = [
      "https%3A//www.googleapis.com/auth/userinfo.email",

      "https%3A//www.googleapis.com/auth/userinfo.profile",
    ];
    const GOOGLE_OAUTH_URL = process.env.GOOGLE_OAUTH_URL;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    const GOOGLE_CALLBACK_URL = `${process.env.BASE_URL}/api/auth/google/callback`;

    const scopes = GOOGLE_OAUTH_SCOPES.join(" ");

    const GOOGLE_CONSENT_SCREEN_URL = `${GOOGLE_OAUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URL}&response_type=code&scope=${scopes}&state=${some_state}`;

    console.log(GOOGLE_CONSENT_SCREEN_URL);

    res.redirect(GOOGLE_CONSENT_SCREEN_URL);
  } catch (error) {
    console.error("Error during Google OAuth:", error);
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

    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    const GOOGLE_ACCESS_TOKEN_URL = process.env.GOOGLE_ACCESS_TOKEN_URL;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    const data = {
      code: code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BASE_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    };

    const response = await axios.post(
      GOOGLE_ACCESS_TOKEN_URL!,
      JSON.stringify(data)
    );

    const { id_token } = response.data;

    console.log("Google Id Token:", id_token);

    const token_info_response = await fetch(
      `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
    );

    res
      .status(token_info_response.status)
      .json(await token_info_response.json());
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
