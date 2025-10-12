"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            <div className="container relative mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                        <Sparkles className="size-4 text-primary" />
                        <span>AI-Powered Development Platform</span>
                    </div>

                    {/* Main heading */}
                    <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Turn Ideas Into
                        <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            {" "}
                            Production-Ready{" "}
                        </span>
                        Apps
                    </h1>

                    {/* Subheading */}
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        Describe your vision and watch Codex build it. From concept to deployment,
                        our AI transforms your ideas into fully functional applications through conversation.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="group w-full sm:w-auto">
                            <Link href="/editor">
                                Start Building Free
                                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link href="/community">
                                <Github className="mr-2 size-4" />
                                View Examples
                            </Link>
                        </Button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-green-500" />
                            <span>Real-time collaboration</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-blue-500" />
                            <span>Cloud-powered execution</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-purple-500" />
                            <span>Production-ready code</span>
                        </div>
                    </div>
                </div>

                {/* Visual preview - placeholder for future demo */}
                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="relative rounded-xl border bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
                        <div className="aspect-video overflow-hidden rounded-lg border bg-muted/30">
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <Sparkles className="mx-auto mb-4 size-16 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">
                                        Interactive demo coming soon
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
