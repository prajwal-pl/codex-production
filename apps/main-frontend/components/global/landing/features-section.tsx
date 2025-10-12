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

const features = [
    {
        icon: Sparkles,
        title: "AI-Powered Code Generation",
        description: "Describe your app in plain English and watch as Codex generates production-ready code with proper architecture and best practices.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        icon: Terminal,
        title: "Interactive Editor",
        description: "Real-time code editing with Monaco editor, file explorer, and live preview. See your changes instantly as you build.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        icon: Cloud,
        title: "Cloud Execution",
        description: "Run your applications in secure E2B sandboxes. No local setup required - everything runs in the cloud.",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        icon: GitBranch,
        title: "Conversation-Based Development",
        description: "Iterate on your project through natural conversation. Ask for changes, add features, fix bugs - all through chat.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    {
        icon: Layers,
        title: "Full-Stack Applications",
        description: "Generate complete applications with frontend, backend, database, and deployment configuration. No manual setup needed.",
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Work together with your team in real-time. Share projects, review code, and build together seamlessly.",
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
    },
    {
        icon: Code2,
        title: "Practice & Learn",
        description: "Improve your coding skills with interactive practice sessions. Save your work and track your progress over time.",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
    },
    {
        icon: Zap,
        title: "Instant Deployment",
        description: "Deploy your applications with a single click. Get production URLs instantly and share your creations with the world.",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
    },
];

export function FeaturesSection() {
    return (
        <section className="border-b bg-background py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Everything You Need to Build Faster
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Powerful features that transform how you build applications.
                        From ideation to deployment, Codex handles the complexity.
                    </p>
                </div>

                {/* Features grid */}
                <div className="mx-auto mt-16 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={feature.title}
                                className="group relative overflow-hidden border bg-card transition-all hover:shadow-lg"
                            >
                                <CardContent className="p-6">
                                    {/* Icon */}
                                    <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.bgColor}`}>
                                        <Icon className={`size-6 ${feature.color}`} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="mb-2 font-semibold">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>

                                    {/* Hover effect */}
                                    <div className="absolute inset-0 border-2 border-transparent transition-colors group-hover:border-primary/20" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-muted-foreground">
                        And many more features to discover as you build
                    </p>
                </div>
            </div>
        </section>
    );
}
