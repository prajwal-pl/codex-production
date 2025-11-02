// Frontend-only enums (mirror backend Prisma enums)
export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
}

export enum SubmissionStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    WRONG_ANSWER = "WRONG_ANSWER",
    TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
    MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED",
    RUNTIME_ERROR = "RUNTIME_ERROR",
    COMPILATION_ERROR = "COMPILATION_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR",
}

export interface DSAProblem {
    id: string;
    slug: string;
    title: string;
    difficulty: Difficulty;
    description: string;
    tags: string[];
    constraints?: string;
    examples: ProblemExample[];
    hints: string[];
    acceptanceRate?: number;
    totalSolved: number;
    solved?: boolean;
    testCases?: DSATestCase[];
    submissions?: DSASubmissionSummary[];
}

export interface ProblemExample {
    input: string;
    output: string;
    explanation?: string;
}

export interface DSATestCase {
    id: string;
    input: any;
    expectedOutput: any;
    explanation?: string;
    isHidden: boolean;
}

export interface DSASubmission {
    id: string;
    userId: string;
    problemId: string;
    language: string;
    version: string;
    code: string;
    status: SubmissionStatus;
    passedTests: number;
    totalTests: number;
    executionTimeMs?: number;
    memoryUsedKb?: number;
    testResults?: TestCaseResult[];
    submittedAt: Date;
    problem?: {
        id: string;
        slug: string;
        title: string;
        difficulty: Difficulty;
    };
}

export interface DSASubmissionSummary {
    id: string;
    status: SubmissionStatus;
    language: string;
    passedTests: number;
    totalTests: number;
    submittedAt: Date;
}

export interface TestCaseResult {
    testCaseId?: string;
    passed: boolean;
    output: string;
    expected: string;
    stderr: string;
    error?: string;
    executionTime?: number;
    memory?: number;
}

export interface PistonRuntime {
    language: string;
    version: string;
    aliases: string[];
}

export interface ExecutionResult {
    language: string;
    version: string;
    run?: {
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
    };
    compile?: {
        stdout: string;
        stderr: string;
        output: string;
        code: number | null;
        signal: string | null;
        message: string | null;
        status: string | null;
    };
}

export interface PracticeStats {
    totalSolved: number;
    totalAttempted: number;
    solvedByDifficulty: {
        easy: number;
        medium: number;
        hard: number;
    };
}

export interface ProblemFilters {
    difficulty?: Difficulty;
    tags?: string[];
    solved?: boolean;
    search?: string;
}
