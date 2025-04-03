import { LANGUAGE_CONFIG } from "app/utils/constants";
import axios from "axios";

export const runPracticeCode = async (code: string, language: string) => {
  const runtime = LANGUAGE_CONFIG[language]?.pistonRuntime;
  try {
    const response = await axios.post(
      `https://emkc.org/api/v2/piston/execute`,
      {
        language: language,
        version: runtime?.version,
        files: [{ content: code }],
      }
    );

    console.log(response.data);
    return response.data.run.output;
  } catch (error) {
    console.error("Error running code:", error);
  }
};
