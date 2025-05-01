import { LANGUAGE_CONFIG } from "app/utils/constants";
import axios from "axios";

type CodeExecutionResult = {
  output: string;
  stderr: string;
  stdout: string;
  code: number | null;
};

export const runPracticeCode = async (
  code: string,
  language: string
): Promise<CodeExecutionResult> => {
  const runtime = LANGUAGE_CONFIG[language]?.pistonRuntime;
  try {
    const response = await axios.post(process.env.PISTON_API!, {
      language: language,
      version: runtime?.version,
      files: [{ content: code }],
    });

    console.log(response.data.run.output);

    return {
      output: response.data.run.output || "",
      stderr: response.data.run.stderr || "",
      stdout: response.data.run.stdout || "",
      code: response.data.run.code || null,
    };
  } catch (error) {
    console.error("Error running code:", error);
    return {
      output: "Error executing code",
      stderr: error instanceof Error ? error.message : String(error),
      stdout: "",
      code: null,
    };
  }
};
