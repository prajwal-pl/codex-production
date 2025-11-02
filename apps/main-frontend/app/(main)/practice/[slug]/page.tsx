"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getProblemBySlug, submitCode, executeCode, getRuntimes } from "@/lib/api-client";
import type { DSAProblem, PistonRuntime, ExecutionResult, DSASubmission } from "@/types/practice";
import { DifficultyBadge } from "@/components/global/practice/difficulty-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPlayerPlay, IconSend, IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const ProblemDetailPage = () => {
    const params = useParams();
    const slug = params.slug as string;

    const [problem, setProblem] = useState<DSAProblem | null>(null);
    const [runtimes, setRuntimes] = useState<PistonRuntime[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
    const [code, setCode] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
    const [submissionResult, setSubmissionResult] = useState<DSASubmission | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [problemRes, runtimesRes] = await Promise.all([
                    getProblemBySlug(slug),
                    getRuntimes(),
                ]);
                setProblem(problemRes.data);
                setRuntimes(runtimesRes.data);

                // Set initial code template based on language
                setCode(getCodeTemplate("python"));
            } catch (error) {
                console.error("Failed to fetch problem:", error);
                toast.error("Failed to load problem");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const getCodeTemplate = (language: string): string => {
        const templates: Record<string, string> = {
            python: "# Write your solution here\n\ndef solution():\n    pass\n\nprint(solution())",
            javascript: "// Write your solution here\n\nfunction solution() {\n    // Your code\n}\n\nconsole.log(solution());",
            java: "public class Solution {\n    public static void main(String[] args) {\n        // Your code\n    }\n}",
            cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code\n    return 0;\n}",
            c: "#include <stdio.h>\n\nint main() {\n    // Your code\n    return 0;\n}",
        };
        return templates[language] || "// Write your solution here\n";
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
        setCode(getCodeTemplate(language));
        setExecutionResult(null);
        setSubmissionResult(null);
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            toast.error("Please write some code first");
            return;
        }

        setExecuting(true);
        setExecutionResult(null);

        try {
            const result = await executeCode({
                language: selectedLanguage,
                code,
                stdin: problem?.testCases?.[0]?.input?.toString() || "",
            });
            setExecutionResult(result.data);
            toast.success("Code executed successfully");
        } catch (error: any) {
            toast.error(error.message || "Execution failed");
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmit = async () => {
        if (!problem || !code.trim()) {
            toast.error("Please write some code first");
            return;
        }

        setSubmitting(true);
        setSubmissionResult(null);

        try {
            const result = await submitCode({
                problemId: problem.id,
                language: selectedLanguage,
                code,
            });
            setSubmissionResult(result.data);

            if (result.data.status === "ACCEPTED") {
                toast.success("🎉 All test cases passed!");
            } else {
                toast.error(`Submission failed: ${result.data.status}`);
            }
        } catch (error: any) {
            toast.error(error.message || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-7xl px-4">
                <Skeleton className="mb-4 h-10 w-full" />
                <div className="grid gap-4 lg:grid-cols-2">
                    <Skeleton className="h-[600px]" />
                    <Skeleton className="h-[600px]" />
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-12 text-center">
                <p className="text-muted-foreground">Problem not found</p>
            </div>
        );
    }

    const selectedRuntime = runtimes.find(
        (r) => r.language === selectedLanguage || r.aliases.includes(selectedLanguage)
    );

    return (
        <div className="container mx-auto max-w-7xl px-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <DifficultyBadge difficulty={problem.difficulty} />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Problem Description */}
                <Card className="h-[calc(100vh-12rem)] overflow-auto">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap">{problem.description}</div>
                        </div>

                        {problem.examples && problem.examples.length > 0 && (
                            <div>
                                <h3 className="mb-2 font-semibold">Examples</h3>
                                <div className="space-y-4">
                                    {problem.examples.map((example: any, i: number) => (
                                        <div key={i} className="rounded-lg border bg-muted/50 p-4">
                                            <div className="space-y-2 font-mono text-sm">
                                                <div>
                                                    <span className="font-semibold">Input:</span> {example.input}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Output:</span> {example.output}
                                                </div>
                                                {example.explanation && (
                                                    <div className="text-muted-foreground">
                                                        {example.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {problem.constraints && (
                            <div>
                                <h3 className="mb-2 font-semibold">Constraints</h3>
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <pre className="whitespace-pre-wrap font-mono text-sm">
                                        {problem.constraints}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="mb-2 font-semibold">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {problem.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Code Editor */}
                <div className="flex h-[calc(100vh-12rem)] flex-col gap-4">
                    <Card className="flex-1 overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Code Editor</CardTitle>
                                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["python", "javascript", "java", "cpp", "c", "go", "rust"].map((lang) => (
                                            <SelectItem key={lang} value={lang}>
                                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-5rem)] p-0">
                            <Editor
                                height="100%"
                                language={selectedLanguage === "cpp" ? "cpp" : selectedLanguage}
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleRunCode}
                            disabled={executing || submitting}
                            variant="outline"
                            className="flex-1"
                        >
                            {executing ? (
                                <>
                                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <IconPlayerPlay className="mr-2 size-4" />
                                    Run Code
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={executing || submitting}
                            className="flex-1"
                        >
                            {submitting ? (
                                <>
                                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <IconSend className="mr-2 size-4" />
                                    Submit
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Results */}
                    {(executionResult || submissionResult) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    {submissionResult ? "Submission Result" : "Execution Output"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="output">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="output">Output</TabsTrigger>
                                        <TabsTrigger value="stderr">Errors</TabsTrigger>
                                        {submissionResult && <TabsTrigger value="tests">Tests</TabsTrigger>}
                                    </TabsList>
                                    <TabsContent value="output" className="mt-4">
                                        <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm">
                                            {executionResult?.run?.stdout || submissionResult?.testResults?.[0]?.output || "No output"}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="stderr" className="mt-4">
                                        <div className="rounded-lg border bg-muted/50 p-4 font-mono text-sm text-destructive">
                                            {executionResult?.run?.stderr || "No errors"}
                                        </div>
                                    </TabsContent>
                                    {submissionResult && (
                                        <TabsContent value="tests" className="mt-4 space-y-2">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    Passed: {submissionResult.passedTests}/{submissionResult.totalTests}
                                                </span>
                                                <Badge variant={submissionResult.status === "ACCEPTED" ? "default" : "destructive"}>
                                                    {submissionResult.status}
                                                </Badge>
                                            </div>
                                            {submissionResult.testResults?.map((test: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 rounded-lg border p-3"
                                                >
                                                    {test.passed ? (
                                                        <IconCheck className="size-5 text-emerald-500" />
                                                    ) : (
                                                        <IconX className="size-5 text-destructive" />
                                                    )}
                                                    <span className="text-sm">Test Case {i + 1}</span>
                                                    {test.error && (
                                                        <span className="ml-auto text-xs text-muted-foreground">
                                                            {test.error}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </TabsContent>
                                    )}
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemDetailPage;
