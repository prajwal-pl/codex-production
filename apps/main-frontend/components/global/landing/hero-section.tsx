"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroVisual } from "./hero-visual";

const trustSignals = [
    {
        label: "Real-time collaboration",
        color: "bg-emerald-400",
        delay: "0ms",
    },
    {
        label: "Cloud-powered execution",
        color: "bg-sky-400",
        delay: "80ms",
    },
    {
        label: "Production-ready code",
        color: "bg-violet-400",
        delay: "160ms",
    },
];

export function HeroSection() {
    return (
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background/30 to-muted/10">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

            <div className="container relative mx-auto px-4 py-20 sm:px-6 md:py-28 lg:px-8">
                <div className="grid items-center gap-16 lg:grid-cols-[1fr_minmax(360px,460px)]">
                    <div className="relative z-[1] text-left">
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.35)] backdrop-blur">
                            <Sparkles className="size-4 text-primary" />
                            <span className="tracking-wide">AI-Powered Development Platform</span>
                        </div>

                        <h1 className="animate-fade-up mb-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-50 sm:text-6xl lg:text-6xl" style={{ animationDelay: "60ms" }}>
                            Turn Ideas Into
                            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                {" "}
                                Production-Ready{" "}
                            </span>
                            Apps
                        </h1>

                        <p
                            className="animate-fade-up mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl"
                            style={{ animationDelay: "120ms" }}
                        >
                            Describe your vision and watch Codex build it. From concept to deployment, our AI engineer
                            transforms conversations into fully functional applications and ships them to production.
                        </p>

                        <div className="animate-fade-up flex flex-col items-start gap-4 sm:flex-row" style={{ animationDelay: "180ms" }}>
                            <Button asChild size="lg" className="group w-full sm:w-auto">
                                <Link href="/editor">
                                    Start Building Free
                                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full border-white/20 bg-white/5 text-slate-200 backdrop-blur sm:w-auto">
                                <Link href="/community">
                                    <Github className="mr-2 size-4" />
                                    View Examples
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-12 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                            {trustSignals.map((signal) => (
                                <div
                                    key={signal.label}
                                    className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 backdrop-blur"
                                    style={{ animationDelay: signal.delay }}
                                >
                                    <span className={cn("size-2 rounded-full", signal.color)} />
                                    <span>{signal.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <HeroVisual className="animate-fade-in" />
                </div>
            </div>
        </section>
    );
}
