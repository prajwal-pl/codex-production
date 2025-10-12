"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
    return (
        <section className="border-b bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 py-24 sm:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Icon */}
                    <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
                        <Sparkles className="size-8 text-primary" />
                    </div>

                    {/* Heading */}
                    <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Ready to Build Something Amazing?
                    </h2>

                    {/* Description */}
                    <p className="mb-10 text-lg text-muted-foreground">
                        Join thousands of developers who are already building faster with Codex.
                        Start your first project today - no credit card required.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="group w-full sm:w-auto">
                            <Link href="/editor">
                                Start Building Now
                                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link href="/dashboard">
                                View Dashboard
                            </Link>
                        </Button>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Free to start</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>No credit card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="size-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
