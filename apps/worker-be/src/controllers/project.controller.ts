import { Request, Response } from "express";
import Groq from "groq-sdk";
import prisma from "db/index";
import { getSystemPrompt } from "../lib/systemPrompt";

const groq = new Groq({
  apiKey: "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",
});

const groqClient = new Groq({
  apiKey: "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",
});

console.log(process.env.GROQ_API_KEY!, "GROQ API KEY");

export const createProjectHandler = async (req: Request, res: Response) => {
  const { prompt } = req.body;
  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: "assistant", content: getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      stream: true,
    });

    for await (const chunk of response) {
      if (chunk.choices[0].delta.content) {
        console.log(`${chunk.choices[0].delta.content}`);
        res.write(
          chunk.choices[0].delta.content.replace(/^\s+|\s+$/g, "") + "\n"
        );
      }
    }

    // console.log(response.choices[0].message.content);
    // return res.status(200).json({
    //   message: "Project created successfully",
    //   project: response.choices[0].message.content,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
