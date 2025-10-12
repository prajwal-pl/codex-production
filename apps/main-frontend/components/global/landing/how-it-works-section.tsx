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
        <section className="border-b bg-muted/30 py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        How It Works
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Four simple steps from idea to deployment.
                        No setup, no configuration - just start building.
                    </p>
                </div>

                {/* Steps */}
                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.number}
                                    className="group relative"
                                >
                                    {/* Connector line (hidden on mobile, shown between items) */}
                                    {index < steps.length - 1 && index % 2 === 0 && (
                                        <div className="absolute left-1/2 top-full hidden h-8 w-px -translate-x-1/2 bg-border lg:block" />
                                    )}

                                    <div className="relative flex gap-6">
                                        {/* Number badge */}
                                        <div className="flex-shrink-0">
                                            <div className={`flex size-12 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                                                <Icon className="size-6" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="mb-1 text-sm font-medium text-muted-foreground">
                                                Step {step.number}
                                            </div>
                                            <h3 className="mb-2 text-xl font-semibold">
                                                {step.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom note */}
                <div className="mx-auto mt-16 max-w-2xl rounded-lg border bg-card p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Pro tip:</span> You can continue refining your project through conversation at any time.
                        Codex understands context and helps you iterate quickly.
                    </p>
                </div>
            </div>
        </section>
    );
}
