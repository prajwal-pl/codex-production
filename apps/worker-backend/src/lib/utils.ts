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

/**
 * Auto-fix Vite configuration for E2B Sandbox
 * Ensures server.host = '0.0.0.0' and allowedHosts accepts all e2b.dev domains
 */
async function autoFixViteConfig(sandbox: Sandbox, executionId: string): Promise<void> {
    try {
        // Check if vite.config.js or vite.config.ts exists
        const configFiles = ['vite.config.js', 'vite.config.ts'];

        for (const configFile of configFiles) {
            const exists = await sandbox.files.exists(configFile);

            if (exists) {
                let content = await sandbox.files.read(configFile);
                let wasPatched = false;
                const patchedFields: string[] = [];

                logger.info(`Checking ${configFile} for E2B compatibility`);

                // Check if server block exists
                const hasServerBlock = /server\s*:\s*\{/.test(content);

                if (hasServerBlock) {
                    // Server block exists, check and patch individual fields

                    // Add host if missing
                    if (!/host\s*:/.test(content)) {
                        content = content.replace(
                            /(server\s*:\s*\{)/,
                            `$1\n    host: '0.0.0.0',`
                        );
                        patchedFields.push("host: '0.0.0.0'");
                        wasPatched = true;
                    }

                    // Add allowedHosts if missing
                    if (!/allowedHosts/.test(content)) {
                        content = content.replace(
                            /(server\s*:\s*\{)/,
                            `$1\n    allowedHosts: ['.e2b.dev', '.e2b.app'],`
                        );
                        patchedFields.push("allowedHosts: ['.e2b.dev', '.e2b.app']");
                        wasPatched = true;
                    }
                } else {
                    // No server block exists, add complete configuration
                    if (/export default defineConfig\s*\(\s*\{/.test(content)) {
                        content = content.replace(
                            /export default defineConfig\s*\(\s*\{/,
                            `export default defineConfig({\n  server: {\n    host: '0.0.0.0',\n    port: 5173,\n    strictPort: false,\n    allowedHosts: ['.e2b.dev', '.e2b.app'],\n  },`
                        );
                        patchedFields.push("Complete server configuration block");
                        wasPatched = true;
                    }
                }

                if (wasPatched) {
                    await sandbox.files.write(configFile, content);

                    await prisma.sandboxLog.create({
                        data: {
                            executionId,
                            type: "system",
                            content: `✅ Auto-patched ${configFile} for E2B Sandbox:\n${patchedFields.map(f => `- ${f}`).join('\n')}\n\nThis ensures:\n- Server listens on all interfaces (not just localhost)\n- E2B proxy domains are whitelisted`,
                        },
                    });

                    logger.info(`Successfully patched ${configFile}`, { fields: patchedFields });
                } else {
                    logger.info(`${configFile} already configured for E2B`);
                }

                return; // Found and processed config file
            }
        }

        logger.info("No Vite config file found - project may not be using Vite");
    } catch (error) {
        logger.warn("Could not auto-fix Vite config", { error });
        // Don't throw - this is a best-effort fix
    }
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

    // ✅ Auto-fix Vite config for E2B if it exists
    await autoFixViteConfig(sandbox, executionId);

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

    // ✅ Detect if this is a dev server command that should run in background
    const isDevServerCommand = /(?:npm|yarn|pnpm)\s+(?:run\s+)?(?:dev|start)|next\s+dev|vite|react-scripts\s+start/i.test(command);

    // Log command execution
    await prisma.sandboxLog.create({
        data: {
            executionId,
            type: "system",
            content: `Executing: ${command}${isDevServerCommand ? ' (in background)' : ''}`,
        },
    });

    if (isDevServerCommand) {
        // ✅ Run dev server in background using nohup
        logger.info("Detected dev server command, running in background", { command });

        // Start dev server in background and redirect output to log file
        const bgCommand = `nohup bash -c '${command}' > /tmp/dev-server.log 2>&1 & echo $!`;

        const startResult = await sandbox.commands.run(bgCommand, {
            timeoutMs: 10000, // Just wait for process to start
        });

        const pid = startResult.stdout.trim();

        await prisma.sandboxLog.create({
            data: {
                executionId,
                type: "system",
                content: `Dev server started in background with PID: ${pid}`,
            },
        });

        // Wait a bit for server to initialize
        await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds

        // Capture initial logs from the background process
        try {
            const logCheck = await sandbox.commands.run("tail -50 /tmp/dev-server.log 2>/dev/null || echo 'No logs yet'");

            if (logCheck.stdout && logCheck.stdout !== 'No logs yet') {
                await prisma.sandboxLog.create({
                    data: {
                        executionId,
                        type: "stdout",
                        content: logCheck.stdout,
                    },
                });
            }

            // Check if process is still running
            const processCheck = await sandbox.commands.run(`ps -p ${pid} > /dev/null 2>&1 && echo "running" || echo "stopped"`);

            if (processCheck.stdout.includes('stopped')) {
                // Process died, get the logs
                const errorLogs = await sandbox.commands.run("cat /tmp/dev-server.log 2>/dev/null || echo 'No error logs'");

                await prisma.sandboxLog.create({
                    data: {
                        executionId,
                        type: "stderr",
                        content: `Dev server process died. Logs:\n${errorLogs.stdout}`,
                    },
                });

                throw new Error(`Dev server failed to start. Check logs for details.`);
            } else {
                await prisma.sandboxLog.create({
                    data: {
                        executionId,
                        type: "system",
                        content: `Dev server is running (PID: ${pid})`,
                    },
                });
            }
        } catch (error) {
            logger.warn("Could not capture dev server logs", { error });
        }

        result.executedCommands.push(command);
        return;
    }

    // ✅ Regular commands (npm install, etc.) - run normally and wait for completion
    const stdoutLogs: string[] = [];
    const stderrLogs: string[] = [];

    const cmdResult = await sandbox.commands.run(command, {
        onStdout: (data) => {
            stdoutLogs.push(data);
        },
        onStderr: (data) => {
            stderrLogs.push(data);
        },
        timeoutMs: 900000, // 5 minutes timeout
    });

    // Batch save logs to reduce DB writes
    if (stdoutLogs.length > 0) {
        await prisma.sandboxLog.create({
            data: {
                executionId,
                type: "stdout",
                content: stdoutLogs.join("\n"),
            },
        });
    }

    if (stderrLogs.length > 0) {
        await prisma.sandboxLog.create({
            data: {
                executionId,
                type: "stderr",
                content: stderrLogs.join("\n"),
            },
        });
    }

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
        throw new Error(`Command failed with exit code ${cmdResult.exitCode}: ${stderrLogs.join("\n")}`);
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

/**
 * Detect which port the dev server is running on
 * Returns the port number or null if not detected
 */
export async function detectDevServerPort(sandbox: Sandbox, executionId: string): Promise<number | null> {
    logger.info("Detecting dev server port...");

    // Common dev server ports to check
    const commonPorts = [3000, 5173, 8080, 4200, 5000, 3001, 8000];

    // Check dev server logs for port information
    try {
        const logs = await sandbox.commands.run("cat /tmp/dev-server.log 2>/dev/null || echo ''");

        if (logs.stdout) {
            // Log the output for debugging
            await prisma.sandboxLog.create({
                data: {
                    executionId,
                    type: "system",
                    content: `Dev server logs:\n${logs.stdout}`,
                },
            });

            // Extract port from common patterns
            const portPatterns = [
                /Local:\s+https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/i,
                /localhost:(\d+)/i,
                /port\s+(\d+)/i,
                /running (?:at|on).*?:(\d+)/i,
                /http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/i,
            ];

            for (const pattern of portPatterns) {
                const match = logs.stdout.match(pattern);
                if (match && match[1]) {
                    const port = parseInt(match[1], 10);
                    logger.info(`Found port ${port} in dev server logs`);

                    await prisma.sandboxLog.create({
                        data: {
                            executionId,
                            type: "system",
                            content: `Detected dev server port from logs: ${port}`,
                        },
                    });

                    return port;
                }
            }
        }
    } catch (error) {
        logger.warn("Could not read dev server logs", { error });
    }

    // Fallback: Check which ports are actually listening
    try {
        const listeningPorts = await sandbox.commands.run(
            "netstat -tuln 2>/dev/null | grep LISTEN | awk '{print $4}' | grep -oE ':[0-9]+$' | cut -d: -f2 || " +
            "ss -tuln 2>/dev/null | grep LISTEN | awk '{print $5}' | grep -oE ':[0-9]+$' | cut -d: -f2 || " +
            "lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | grep -oE ':[0-9]+' | cut -d: -f2"
        );

        if (listeningPorts.stdout) {
            const ports = listeningPorts.stdout
                .split('\n')
                .map(p => parseInt(p.trim(), 10))
                .filter(p => !isNaN(p) && p > 1024 && p < 65535); // Only user ports

            logger.info("Found listening ports", { ports });

            await prisma.sandboxLog.create({
                data: {
                    executionId,
                    type: "system",
                    content: `Listening ports: ${ports.join(', ')}`,
                },
            });

            // Check common dev server ports first
            for (const commonPort of commonPorts) {
                if (ports.includes(commonPort)) {
                    logger.info(`Found common dev server port: ${commonPort}`);
                    return commonPort;
                }
            }

            // Return the first user port found
            if (ports.length > 0 && ports[0]) {
                logger.info(`Using first detected port: ${ports[0]}`);
                return ports[0];
            }
        }
    } catch (error) {
        logger.warn("Could not detect listening ports", { error });
    }

    // Last resort: try common ports
    for (const port of commonPorts) {
        try {
            const testResult = await sandbox.commands.run(
                `curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:${port} || echo 'fail'`
            );

            if (testResult.stdout && !testResult.stdout.includes('fail') && !testResult.stdout.includes('000')) {
                logger.info(`Port ${port} is responding`);

                await prisma.sandboxLog.create({
                    data: {
                        executionId,
                        type: "system",
                        content: `Detected responding port: ${port} (HTTP ${testResult.stdout})`,
                    },
                });

                return port;
            }
        } catch (error) {
            // Port not responding, continue
        }
    }

    logger.warn("Could not detect dev server port");
    return null;
}