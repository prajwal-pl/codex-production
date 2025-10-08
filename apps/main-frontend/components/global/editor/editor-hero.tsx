"use client";

import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import {
    Plus as IconPlus,
    ArrowUp as IconArrowUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api-client";

export const EditorHero: React.FC = () => {
    const router = useRouter();
    const [value, setValue] = React.useState("");

    const handleSubmit = () => {
        createProject({
            prompt: value,
        }).then((res) => {
            // Redirect to the new editor page
            router.push(`/editor/${res.projectId}`);
        })
        setValue(""); // Clear the input after sending
    }

    return (
        <section className="relative isolate w-full text-white h-[calc(100svh-var(--header-height,0px)-2rem)] md:h-[calc(100svh-var(--header-height,0px)-3rem)] overflow-hidden">
            {/* Spotlight background behind content */}
            <div className="absolute inset-0 z-0">
                {/* <Spotlight gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, .08) 0, hsla(210, 100%, 55%, .02) 50%, hsla(210, 100%, 45%, 0) 80%)" gradientSecond="transparent" translateY={-260} width={640} height={1280} smallWidth={260} duration={8} xOffset={120} fullSize />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" /> */}
                <div className="relative flex min-h-screen w-full flex-col items-start justify-start overflow-hidden">
                    <BackgroundRippleEffect />
                </div>
            </div>
            <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-10 px-4 py-16 text-center md:gap-12 md:py-24">

                <div className="space-y-3 md:space-y-4">
                    <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                        Codex compiles ideas into systems
                    </h1>
                    <p className="mx-auto max-w-2xl text-base text-white/80 md:text-lg">
                        Create apps and websites by chatting with AI
                    </p>
                </div>

                {/* Input panel - minimal glassmorphism inspired composer */}
                <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-card/70 text-white shadow-xl shadow-black/20 backdrop-blur-md">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />

                    <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                            <span className="inline-flex items-center gap-2">
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                                Compose
                            </span>
                            <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-[0.65rem] font-medium tracking-[0.25em] text-white/60">
                                Shift + Enter
                            </span>
                        </div>

                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={"Type your idea and we'll build it together."}
                            rows={4}
                            onKeyDown={(e) => {
                                // Submit on Enter with Shift
                                if (e.key === 'Enter' && e.shiftKey) {
                                    e.preventDefault();
                                    // Handle the send action here
                                    handleSubmit();
                                }
                            }}
                            className="min-h-[7.5rem] w-full resize-none bg-transparent text-base leading-relaxed text-white/90 placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-0"
                        />

                        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-medium uppercase tracking-[0.3em] text-white/60 transition hover:border-white/30 hover:text-white/80"
                                aria-label="Add attachment"
                            >
                                <IconPlus className="size-3.5" />
                                Attach
                            </button>
                            {/* <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-[0.65rem] font-medium tracking-[0.25em] text-white/60">Shift + Enter</span> */}

                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_32px_-12px_rgba(59,130,246,0.55)] transition hover:bg-primary"
                                aria-label="Send"
                                onClick={handleSubmit}
                            >
                                Ship idea
                                <IconArrowUp className="size-4 -rotate-45" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditorHero;
