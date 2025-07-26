import { Request, Response } from "express";
import Groq from "groq-sdk";
import prisma from "db/index";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const createProjectHandler = async (req: Request, res: Response) => {
  try {
  } catch (error) {}
};
