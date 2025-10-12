"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
    product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Documentation", href: "/docs" },
        { label: "Changelog", href: "/changelog" },
    ],
    company: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
    ],
    resources: [
        { label: "Community", href: "/community" },
        { label: "Practice", href: "/practice" },
        { label: "Examples", href: "/examples" },
        { label: "API Reference", href: "/api" },
    ],
    legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
        { label: "Status", href: "/status" },
    ],
};

const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export function Footer() {
    return (
        <footer className="bg-background">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                {/* Main footer content */}
                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Brand column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
                            <Terminal className="size-6" />
                            <span>Codex Inc.</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                            Transform your ideas into production-ready applications with AI-powered development.
                        </p>
                        {/* Social links */}
                        <div className="mt-6 flex gap-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label={social.label}
                                    >
                                        <Icon className="size-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links columns */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Resources</h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Codex Inc. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            {footerLinks.legal.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
