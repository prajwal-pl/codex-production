import { Sandbox } from "@e2b/code-interpreter"
import prisma from "@repo/db/client";
import { logger } from "@trigger.dev/sdk";

interface ParsedAction {
    type: "file" | "shell";
    filePath?: string;
    content?: string;
    command?: string;
}

interface ArtifactExecutionResult {
    createdFiles: Array<{
        path: string;
        size: number;
    }>;
    executedCommands: string[];
    errors: Array<{
        action: ParsedAction;
        error: string;
    }>;
}

export const getSandbox = async (sandboxId: string) => {
    const sandbox = await Sandbox.connect(sandboxId)
    return sandbox
}

export function parseArtifact(code: string): ParsedAction[] {
    const actions: ParsedAction[] = [];

    // Regex to match boltAction tags with their attributes and content
    const actionRegex = /<boltAction\s+type="(file|shell)"(?:\s+filePath="([^"]+)")?\s*>([\s\S]*?)<\/boltAction>/g;

    let match;
    while ((match = actionRegex.exec(code)) !== null) {
        const [, type, filePath, content] = match;

        if (type === "file" && filePath) {
            actions.push({
                type: "file",
                filePath: filePath.trim(),
                content: content!.trim(),
            });
        } else if (type === "shell") {
            actions.push({
                type: "shell",
                command: content!.trim(),
            });
        }
    }

    return actions;
}

function getDirectoryPath(filePath: string): string {
    const parts = filePath.split("/");
    parts.pop(); // Remove filename
    return parts.join("/") || "/";
}

export async function executeArtifact(
    sandbox: Sandbox,
    actions: ParsedAction[],
    executionId: string,
): Promise<ArtifactExecutionResult> {
    const result: ArtifactExecutionResult = {
        createdFiles: [],
        executedCommands: [],
        errors: [],
    };

    logger.info("Starting artifact execution", {
        executionId,
        actionCount: actions.length,
    });

    for (const action of actions) {
        try {
            if (action.type === "file" && action.filePath && action.content) {
                // Create file action
                await executeFileAction(
                    sandbox,
                    action,
                    executionId,
                    result
                );
            } else if (action.type === "shell" && action.command) {
                // Execute shell command
                await executeShellAction(
                    sandbox,
                    action,
                    executionId,
                    prisma,
                    result
                );
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            logger.error("Action execution failed", {
                executionId,
                action,
                error: errorMessage,
            });

            result.errors.push({
                action,
                error: errorMessage,
            });

            // Log error to database
            await prisma.sandboxLog.create({
                data: {
                    executionId,
                    type: "stderr",
                    content: `Error executing ${action.type}: ${errorMessage}`,
                },
            });
        }
    }

    return result;
}

async function executeFileAction(
    sandbox: Sandbox,
    action: ParsedAction,
    executionId: string,
    result: ArtifactExecutionResult
): Promise<void> {
    const { filePath, content } = action;

    if (!filePath || !content) {
        throw new Error("File action missing path or content");
    }

    logger.info("Creating file", { executionId, filePath });

    // Ensure parent directories exist
    const dirPath = getDirectoryPath(filePath);
    if (dirPath && dirPath !== "/") {
        const dirExists = await sandbox.files.exists(dirPath);
        if (!dirExists) {
            await sandbox.files.makeDir(dirPath);

            await prisma.sandboxLog.create({
                data: {
                    executionId,
                    type: "system",
                    content: `Created directory: ${dirPath}`,
                },
            });
        }
    }

    // Write file
    const writeInfo = await sandbox.files.write(filePath, content);

    // Store file metadata
    result.createdFiles.push({
        path: filePath,
        size: Buffer.from(content).length,
    });

    // Log to database
    await prisma.sandboxLog.create({
        data: {
            executionId,
            type: "system",
            content: `Created file: ${filePath} (${writeInfo.type})`,
        },
    });

    // Store as artifact in database
    await prisma.codeArtifact.create({
        data: {
            executionId,
            filename: writeInfo.name,
            path: filePath,
            content,
            mimeType: getMimeType(filePath),
            size: Buffer.from(content).length,
        },
    });

    logger.info("File created successfully", {
        executionId,
        filePath,
        size: Buffer.from(content).length,
    });
}

async function executeShellAction(
    sandbox: Sandbox,
    action: ParsedAction,
    executionId: string,
    prisma: any,
    result: ArtifactExecutionResult
): Promise<void> {
    const { command } = action;

    if (!command) {
        throw new Error("Shell action missing command");
    }

    logger.info("Executing command", { executionId, command });

    // Log command execution
    await prisma.sandboxLog.create({
        data: {
            executionId,
            type: "system",
            content: `Executing: ${command}`,
        },
    });

    // Execute command with output streaming
    const cmdResult = await sandbox.commands.run(command, {
        onStdout: async (data) => {
            await prisma.sandboxLog.create({
                data: {
                    executionId,
                    type: "stdout",
                    content: data,
                },
            });
        },
        onStderr: async (data) => {
            await prisma.sandboxLog.create({
                data: {
                    executionId,
                    type: "stderr",
                    content: data,
                },
            });
        },
        timeoutMs: 300000, // 5 minutes timeout
    });

    result.executedCommands.push(command);

    // Log completion
    await prisma.sandboxLog.create({
        data: {
            executionId,
            type: "system",
            content: `Command completed with exit code: ${cmdResult.exitCode}`,
        },
    });

    if (cmdResult.exitCode !== 0) {
        throw new Error(`Command failed with exit code ${cmdResult.exitCode}: ${cmdResult.stderr}`);
    }

    logger.info("Command executed successfully", {
        executionId,
        command,
        exitCode: cmdResult.exitCode,
    });
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        html: "text/html",
        css: "text/css",
        js: "application/javascript",
        jsx: "application/javascript",
        ts: "application/typescript",
        tsx: "application/typescript",
        json: "application/json",
        md: "text/markdown",
        txt: "text/plain",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        pdf: "application/pdf",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
}