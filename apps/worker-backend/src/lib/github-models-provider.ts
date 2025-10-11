import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { logger } from "@trigger.dev/sdk/v3";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference";
const DEFAULT_MODEL = "openai/gpt-4.1";

if (!GITHUB_TOKEN) {
    logger.warn("⚠️  GITHUB_TOKEN not set - GitHub Models API will not work");
}

export interface GitHubModelsMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface GitHubModelsOptions {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    model?: string;
}

/**
 * Generate text using GitHub Models API (GPT-4.1)
 * 
 * @param messages - Array of conversation messages
 * @param options - Optional configuration for the model
 * @returns Generated text response
 */
export async function generateWithGitHubModels(
    messages: GitHubModelsMessage[],
    options: GitHubModelsOptions = {}
): Promise<{
    content: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}> {
    if (!GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN environment variable is not set");
    }

    const {
        temperature = 0.7,
        topP = 1.0,
        maxTokens = 4096,
        model = DEFAULT_MODEL,
    } = options;

    logger.info("🤖 Generating with GitHub Models API", {
        model,
        messageCount: messages.length,
        temperature,
        maxTokens,
    });

    const client = ModelClient(
        GITHUB_MODELS_ENDPOINT,
        new AzureKeyCredential(GITHUB_TOKEN)
    );

    const response = await client.path("/chat/completions").post({
        body: {
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
            temperature,
            top_p: topP,
            max_tokens: maxTokens,
            model,
        },
    });

    if (isUnexpected(response)) {
        logger.error("GitHub Models API error", {
            error: response.body.error,
        });
        throw new Error(`GitHub Models API error: ${JSON.stringify(response.body.error)}`);
    }

    const content = response.body.choices[0]?.message?.content || "";
    const usage = response.body.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    logger.info("✅ GitHub Models generation complete", {
        responseLength: content.length,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
    });

    if (!content || content.trim().length === 0) {
        throw new Error("GitHub Models API returned empty response");
    }

    return {
        content,
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
    };
}

/**
 * Available GitHub Models
 */
export const GITHUB_MODELS = {
    GPT_4_1: "openai/gpt-4.1",
    GPT_4O: "openai/gpt-4o",
    GPT_4O_MINI: "openai/gpt-4o-mini",
} as const;
