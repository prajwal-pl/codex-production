"use client";

import React from "react";
import { MessageSquare, Code, Rocket, CheckCircle2 } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: MessageSquare,
        title: "Describe Your Idea",
        description: "Tell Codex what you want to build in plain English. No technical jargon required.",
        color: "from-purple-500 to-pink-500",
    },
    {
        number: "02",
        icon: Code,
        title: "AI Generates Code",
        description: "Our AI analyzes your request and generates production-ready code with proper architecture.",
        color: "from-blue-500 to-cyan-500",
    },
    {
        number: "03",
        icon: CheckCircle2,
        title: "Review & Refine",
        description: "Iterate through conversation. Ask for changes, add features, or fix issues instantly.",
        color: "from-green-500 to-emerald-500",
    },
    {
        number: "04",
        icon: Rocket,
        title: "Deploy & Share",
        description: "Launch your application with one click. Get a live URL and share your creation.",
        color: "from-orange-500 to-yellow-500",
    },
];

export function HowItWorksSection() {
    return (
        <section className="relative border-b bg-muted/30 py-24 sm:py-32">
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="animate-fade-up mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        How It Works
                    </h2>
                    <p
                        className="animate-fade-up text-lg text-muted-foreground"
                        style={{ animationDelay: "90ms" }}
                    >
                        Four simple steps from idea to deployment.
                        No setup, no configuration - just start building.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.number}
                                    className="animate-fade-up group relative"
                                    style={{ animationDelay: `${index * 110}ms` }}
                                >
                                    {index < steps.length - 1 && index % 2 === 0 && (
                                        <div className="absolute left-1/2 top-full hidden h-8 w-px -translate-x-1/2 bg-border/60 lg:block" />
                                    )}

                                    <div className="relative flex gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.6)] backdrop-blur transition duration-500 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/10">
                                        <div className="flex-shrink-0">
                                            <div className={`flex size-12 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-white shadow-lg shadow-primary/40`}>
                                                <Icon className="size-6" />
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="mb-1 text-sm font-medium text-slate-300">
                                                Step {step.number}
                                            </div>
                                            <h3 className="mb-2 text-xl font-semibold text-slate-100">
                                                {step.title}
                                            </h3>
                                            <p className="text-slate-300">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div
                    className="animate-fade-up mx-auto mt-16 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
                    style={{ animationDelay: "440ms" }}
                >
                    <p className="text-sm text-slate-300">
                        <span className="font-semibold text-slate-100">Pro tip:</span> You can continue refining your project through conversation at any time.
                        Codex understands context and helps you iterate quickly.
                    </p>
                </div>
            </div>
        </section>
    );
}
