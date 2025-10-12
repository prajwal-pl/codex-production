"use client";

import React from "react";
import {
    Sparkles,
    Code2,
    Layers,
    Zap,
    Users,
    Cloud,
    Terminal,
    GitBranch
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
    {
        icon: Sparkles,
        title: "AI-Powered Code Generation",
        description: "Describe your app in plain English and watch as Codex generates production-ready code with proper architecture and best practices.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        delay: "0ms",
    },
    {
        icon: Terminal,
        title: "Interactive Editor",
        description: "Real-time code editing with Monaco editor, file explorer, and live preview. See your changes instantly as you build.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        delay: "60ms",
    },
    {
        icon: Cloud,
        title: "Cloud Execution",
        description: "Run your applications in secure E2B sandboxes. No local setup required - everything runs in the cloud.",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        delay: "120ms",
    },
    {
        icon: GitBranch,
        title: "Conversation-Based Development",
        description: "Iterate on your project through natural conversation. Ask for changes, add features, fix bugs - all through chat.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        delay: "180ms",
    },
    {
        icon: Layers,
        title: "Full-Stack Applications",
        description: "Generate complete applications with frontend, backend, database, and deployment configuration. No manual setup needed.",
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        delay: "240ms",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Work together with your team in real-time. Share projects, review code, and build together seamlessly.",
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
        delay: "300ms",
    },
    {
        icon: Code2,
        title: "Practice & Learn",
        description: "Improve your coding skills with interactive practice sessions. Save your work and track your progress over time.",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        delay: "360ms",
    },
    {
        icon: Zap,
        title: "Instant Deployment",
        description: "Deploy your applications with a single click. Get production URLs instantly and share your creations with the world.",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        delay: "420ms",
    },
];

export function FeaturesSection() {
    return (
        <section className="relative border-b bg-background py-24 sm:py-32">
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="animate-fade-up mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Everything You Need to Build Faster
                    </h2>
                    <p
                        className="animate-fade-up text-lg text-muted-foreground"
                        style={{ animationDelay: "90ms" }}
                    >
                        Powerful features that transform how you build applications.
                        From ideation to deployment, Codex handles the complexity.
                    </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={feature.title}
                                className="animate-fade-up group relative overflow-hidden border border-white/10 bg-card/80 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_30px_80px_-40px_rgba(59,130,246,0.65)]"
                                style={{ animationDelay: feature.delay || `${index * 60}ms` }}
                            >
                                <CardContent className="relative z-[1] p-6">
                                    <div className={cn("mb-4 inline-flex rounded-xl p-3", feature.bgColor)}>
                                        <Icon className={cn("size-6", feature.color)} />
                                    </div>

                                    <h3 className="mb-2 text-lg font-semibold text-slate-100">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm text-slate-300">
                                        {feature.description}
                                    </p>

                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="animate-fade-up mt-16 text-center" style={{ animationDelay: "480ms" }}>
                    <p className="text-sm text-slate-400">
                        And many more features to discover as you build
                    </p>
                </div>
            </div>
        </section>
    );
}
