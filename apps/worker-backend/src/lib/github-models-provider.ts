import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { logger } from "@trigger.dev/sdk/v3";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference";
const DEFAULT_MODEL = "gpt-4.1"; // GPT-4.1: 1,049K input tokens! Best for code generation with large context

if (!GITHUB_TOKEN) {
    logger.warn("⚠️  GITHUB_TOKEN not set - GitHub Models API will not work");
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Calculate total estimated tokens for messages
 */
function estimateMessageTokens(messages: GitHubModelsMessage[]): number {
    return messages.reduce((total, msg) => total + estimateTokens(msg.content), 0);
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
        maxTokens = 16384, // GPT-4.1 supports up to 33K output tokens
        model = DEFAULT_MODEL,
    } = options;

    // Estimate input tokens for monitoring
    const estimatedInputTokens = estimateMessageTokens(messages);

    // GitHub Models token limits (verified from GitHub Models marketplace)
    const modelLimits = {
        "gpt-4.1": { input: 1049000, output: 33000 },             // 1M+ input! Best for code
        "openai/gpt-4o": { input: 8000, output: 4096 },           // Limited to 8K on GitHub
        "openai/gpt-4o-mini": { input: 8000, output: 4096 },      // Limited to 8K on GitHub
        "gpt-4-turbo": { input: 128000, output: 4096 },
        "gpt-4": { input: 8192, output: 4096 },
        "gpt-3.5-turbo": { input: 16385, output: 4096 },
    };

    const limits = modelLimits[model as keyof typeof modelLimits] || { input: 1049000, output: 33000 };

    logger.info("🤖 Generating with GitHub Models API", {
        model,
        messageCount: messages.length,
        temperature,
        maxTokens,
        estimatedInputTokens,
    });

    // NOTE: Removed token limit checks per user request
    // Let the API handle token limits - don't pre-validate

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
 * Available GitHub Models with their capabilities
 * Source: https://github.com/marketplace/models
 */
export const GITHUB_MODELS = {
    GPT_4_1: "gpt-4.1",                // 1,049K input, 33K output - BEST for code generation!
    GPT_4_TURBO: "gpt-4-turbo",        // 128K input, 4K output
    GPT_4O: "openai/gpt-4o",           // 8K input, 4K output (limited on GitHub)
    GPT_4O_MINI: "openai/gpt-4o-mini", // 8K input, 4K output (limited on GitHub)
} as const;
