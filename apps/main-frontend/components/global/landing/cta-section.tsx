"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
    return (
        <section className="relative border-y border-white/10 bg-gradient-to-br from-slate-950 via-primary/15 to-slate-900 py-24 text-slate-100 sm:py-32">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
                <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-pink-500/25 blur-3xl" />
            </div>
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="animate-fade-up mb-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 p-4 backdrop-blur" style={{ animationDelay: "30ms" }}>
                        <Sparkles className="size-8 text-white" />
                    </div>

                    <h2 className="animate-fade-up mb-6 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl" style={{ animationDelay: "90ms" }}>
                        Ready to Build Something Amazing?
                    </h2>

                    <p className="animate-fade-up mb-10 text-lg text-slate-300" style={{ animationDelay: "150ms" }}>
                        Join thousands of developers who are already building faster with Codex.
                        Start your first project today - no credit card required.
                    </p>

                    <div className="animate-fade-up flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "210ms" }}>
                        <Button asChild size="lg" className="group w-full sm:w-auto">
                            <Link href="/editor">
                                Start Building Now
                                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full border-white/20 bg-white/10 text-slate-100 backdrop-blur transition hover:border-white/30 sm:w-auto">
                            <Link href="/dashboard">
                                View Dashboard
                            </Link>
                        </Button>
                    </div>

                    <div className="animate-fade-up mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-200/80" style={{ animationDelay: "270ms" }}>
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Free to start</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>No credit card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
