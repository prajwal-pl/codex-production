"use client";

import React from "react";
import { TrendingUp, Users, Code, Zap } from "lucide-react";

const stats = [
    {
        icon: Code,
        value: "10,000+",
        label: "Projects Generated",
        description: "Applications built with Codex",
    },
    {
        icon: Users,
        value: "5,000+",
        label: "Active Developers",
        description: "Building amazing things",
    },
    {
        icon: Zap,
        value: "99.9%",
        label: "Uptime",
        description: "Reliable cloud infrastructure",
    },
    {
        icon: TrendingUp,
        value: "10x",
        label: "Faster Development",
        description: "Compared to traditional coding",
    },
];

export function StatsSection() {
    return (
        <section className="border-b bg-background py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Trusted by Developers Worldwide
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Join thousands of developers who are building faster and smarter with Codex
                    </p>
                </div>

                {/* Stats grid */}
                <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="group relative overflow-hidden rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg"
                            >
                                {/* Icon */}
                                <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-3">
                                    <Icon className="size-6 text-primary" />
                                </div>

                                {/* Value */}
                                <div className="mb-2 text-4xl font-bold tracking-tight">
                                    {stat.value}
                                </div>

                                {/* Label */}
                                <div className="mb-1 font-semibold">
                                    {stat.label}
                                </div>

                                {/* Description */}
                                <div className="text-sm text-muted-foreground">
                                    {stat.description}
                                </div>

                                {/* Hover gradient */}
                                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        );
                    })}
                </div>

                {/* Testimonial / Quote */}
                <div className="mx-auto mt-16 max-w-3xl">
                    <figure className="rounded-lg border bg-card p-8">
                        <blockquote className="text-center text-lg font-medium">
                            "Codex transformed how we prototype and build applications. What used to take days now takes minutes.
                            The AI understands context incredibly well and generates production-quality code."
                        </blockquote>
                        <figcaption className="mt-6 flex items-center justify-center gap-4">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                JD
                            </div>
                            <div className="text-left">
                                <div className="font-semibold">John Doe</div>
                                <div className="text-sm text-muted-foreground">Lead Developer, TechCorp</div>
                            </div>
                        </figcaption>
                    </figure>
                </div>
            </div>
        </section>
    );
}
