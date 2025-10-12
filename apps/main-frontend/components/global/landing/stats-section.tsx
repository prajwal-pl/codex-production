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
        <section className="relative border-b bg-background py-24 sm:py-32">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="animate-fade-up mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Trusted by Developers Worldwide
                    </h2>
                    <p
                        className="animate-fade-up text-lg text-muted-foreground"
                        style={{ animationDelay: "90ms" }}
                    >
                        Join thousands of developers who are building faster and smarter with Codex
                    </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="animate-fade-up group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 p-6 text-center backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_25px_70px_-45px_rgba(59,130,246,0.65)]"
                                style={{ animationDelay: `${index * 120}ms` }}
                            >
                                <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/15 p-3">
                                    <Icon className="size-6 text-primary" />
                                </div>

                                <div className="mb-1 text-sm uppercase tracking-[0.2em] text-primary/80">
                                    {stat.label}
                                </div>
                                <div className="mb-2 text-4xl font-bold tracking-tight text-slate-100">
                                    {stat.value}
                                </div>

                                <div className="text-sm text-slate-300">
                                    {stat.description}
                                </div>

                                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </div>
                        );
                    })}
                </div>

                <div className="animate-fade-up mx-auto mt-16 max-w-3xl rounded-3xl border border-white/10 bg-card/80 p-8 backdrop-blur" style={{ animationDelay: "480ms" }}>
                    <figure>
                        <blockquote className="text-center text-lg font-medium text-slate-100">
                            “Codex transformed how we prototype and build applications. What used to take days now takes minutes.
                            The AI understands context incredibly well and generates production-quality code.”
                        </blockquote>
                        <figcaption className="mt-6 flex items-center justify-center gap-4 text-left">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                                JD
                            </div>
                            <div>
                                <div className="font-semibold text-slate-100">John Doe</div>
                                <div className="text-sm text-slate-400">Lead Developer, TechCorp</div>
                            </div>
                        </figcaption>
                    </figure>
                </div>
            </div>
        </section>
    );
}
