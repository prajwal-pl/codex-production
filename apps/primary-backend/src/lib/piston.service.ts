import axios, { AxiosError } from "axios";

const PISTON_API_BASE = "https://emkc.org/api/v2/piston";
const RATE_LIMIT_DELAY = 200; // ms between requests (5 req/sec limit)
const RUNTIME_CACHE_TTL = 3600000; // 1 hour in ms

export interface PistonRuntime {
    language: string;
    version: string;
    aliases: string[];
}

export interface ExecuteParams {
    language: string;
    version: string;
    files: { name?: string; content: string }[];
    stdin?: string;
    args?: string[];
    compile_timeout?: number;
    run_timeout?: number;
    compile_memory_limit?: number;
    run_memory_limit?: number;
}

export interface ExecutionOutput {
    stdout: string;
    stderr: string;
    output: string;
    code: number | null;
    signal: string | null;
    message: string | null;
    status: string | null;
    cpu_time?: number;
    wall_time?: number;
    memory?: number;
}

export interface ExecutionResult {
    language: string;
    version: string;
    run?: ExecutionOutput;
    compile?: ExecutionOutput;
}

export interface TestCaseResult {
    passed: boolean;
    output: string;
    expected: string;
    stderr: string;
    executionTime?: number;
    memory?: number;
    error?: string;
}

class PistonService {
    private lastRequestTime = 0;
    private runtimesCache: {
        data: PistonRuntime[];
        timestamp: number;
    } | null = null;

    /**
     * Rate limit requests to respect Piston API's 5 req/sec limit
     */
    private async rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
            await new Promise((resolve) =>
                setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
            );
        }

        this.lastRequestTime = Date.now();
        return fn();
    }

    /**
     * Get available runtimes from Piston API
     * Results are cached for 1 hour
     */
    async getRuntimes(): Promise<PistonRuntime[]> {
        // Return cached data if fresh
        if (
            this.runtimesCache &&
            Date.now() - this.runtimesCache.timestamp < RUNTIME_CACHE_TTL
        ) {
            return this.runtimesCache.data;
        }

        try {
            const response = await this.rateLimitedRequest(() =>
                axios.get<PistonRuntime[]>(`${PISTON_API_BASE}/runtimes`)
            );

            this.runtimesCache = {
                data: response.data,
                timestamp: Date.now(),
            };

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Failed to fetch Piston runtimes:", axiosError.message);
            throw new Error("Failed to fetch available programming languages");
        }
    }

    /**
     * Find a runtime by language name or alias
     */
    async findRuntime(
        language: string,
        version?: string
    ): Promise<PistonRuntime | null> {
        const runtimes = await this.getRuntimes();
        console.log(`Total runtimes available: ${runtimes.length}`);
        const langLower = language.toLowerCase();

        const runtime = runtimes.find(
            (r) =>
                r.language.toLowerCase() === langLower ||
                r.aliases.some((alias) => alias.toLowerCase() === langLower)
        );

        if (!runtime) {
            console.log(`No runtime found for "${language}". Available languages:`, runtimes.slice(0, 5).map(r => r.language));
            return null;
        }

        console.log(`Found runtime:`, { language: runtime.language, version: runtime.version, aliases: runtime.aliases });

        // If specific version requested, validate it matches
        if (version && version !== "*" && runtime.version !== version) {
            console.log(`Version mismatch: requested ${version}, available ${runtime.version}`);
            return null;
        }

        return runtime;
    }

    /**
     * Execute code using Piston API
     */
    async executeCode(params: ExecuteParams): Promise<ExecutionResult> {
        try {
            const response = await this.rateLimitedRequest(() =>
                axios.post<ExecutionResult>(`${PISTON_API_BASE}/execute`, {
                    language: params.language,
                    version: params.version,
                    files: params.files,
                    stdin: params.stdin || "",
                    args: params.args || [],
                    compile_timeout: params.compile_timeout || 10000,
                    run_timeout: params.run_timeout || 3000,
                    compile_memory_limit: params.compile_memory_limit || -1,
                    run_memory_limit: params.run_memory_limit || -1,
                })
            );

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error("Piston execution error:", axiosError.message);

            if (axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }

            throw new Error("Failed to execute code");
        }
    }

    /**
     * Run code against multiple test cases
     */
    async runTestCases(
        code: string,
        language: string,
        version: string,
        testCases: Array<{ input: any; expectedOutput: any }>
    ): Promise<TestCaseResult[]> {
        const results: TestCaseResult[] = [];

        for (const testCase of testCases) {
            try {
                // Convert input to string format for stdin
                // Handle both string values and JSON-encoded values from Prisma
                let stdinInput: string;
                if (typeof testCase.input === "string") {
                    stdinInput = testCase.input;
                } else if (testCase.input === null || testCase.input === undefined) {
                    stdinInput = "";
                } else {
                    stdinInput = String(testCase.input);
                }

                const result = await this.executeCode({
                    language,
                    version,
                    files: [{ content: code }],
                    stdin: stdinInput,
                });

                console.log("Piston execution result:", {
                    compile: result.compile,
                    run: result.run,
                });

                // Check for compilation errors (only for compiled languages)
                if (result.compile && result.compile.code !== 0) {
                    results.push({
                        passed: false,
                        output: result.compile?.stdout || "",
                        expected: String(testCase.expectedOutput),
                        stderr: result.compile?.stderr || "",
                        error: "Compilation failed",
                    });
                    continue;
                }

                // Check run status
                const runOutput = result.run;
                if (!runOutput) {
                    results.push({
                        passed: false,
                        output: "",
                        expected: String(testCase.expectedOutput),
                        stderr: "",
                        error: "No run output received",
                    });
                    continue;
                }

                // Handle runtime errors
                if (runOutput.code !== 0 && runOutput.code !== null) {
                    results.push({
                        passed: false,
                        output: runOutput.stdout,
                        expected: String(testCase.expectedOutput),
                        stderr: runOutput.stderr,
                        ...(runOutput.cpu_time !== undefined && {
                            executionTime: runOutput.cpu_time,
                        }),
                        ...(runOutput.memory !== undefined && {
                            memory: runOutput.memory,
                        }),
                        error:
                            runOutput.message || runOutput.stderr || "Runtime error occurred",
                    });
                    continue;
                }

                // Compare output
                const actualOutput = runOutput.stdout.trim();

                // Convert expected output to string, handling JSON-encoded values from Prisma
                let expectedOutput: string;
                if (typeof testCase.expectedOutput === "string") {
                    expectedOutput = testCase.expectedOutput.trim();
                } else if (testCase.expectedOutput === null || testCase.expectedOutput === undefined) {
                    expectedOutput = "";
                } else {
                    expectedOutput = String(testCase.expectedOutput).trim();
                }

                const passed = actualOutput === expectedOutput;

                results.push({
                    passed,
                    output: actualOutput,
                    expected: expectedOutput,
                    stderr: runOutput.stderr,
                    ...(runOutput.cpu_time !== undefined && {
                        executionTime: runOutput.cpu_time,
                    }),
                    ...(runOutput.memory !== undefined && {
                        memory: runOutput.memory,
                    }),
                });
            } catch (error) {
                console.error("Test case execution error:", error);
                results.push({
                    passed: false,
                    output: "",
                    expected: String(testCase.expectedOutput),
                    stderr: "",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error during execution",
                });
            }
        }

        return results;
    }

    /**
     * Clear runtime cache (useful for testing or force refresh)
     */
    clearCache(): void {
        this.runtimesCache = null;
    }
}

export default new PistonService();
