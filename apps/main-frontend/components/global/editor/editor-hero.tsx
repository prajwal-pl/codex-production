"use client";

import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import {
    Plus as IconPlus,
    ArrowUp as IconArrowUp,
} from "lucide-react";

export const EditorHero: React.FC = () => {
    const [value, setValue] = React.useState("");

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

                {/* Input panel - native elements, aligned to dashboard card aesthetics */}
                <div className="relative mx-auto w-full max-w-3xl rounded-xl border bg-card/90 text-white shadow-sm">
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-primary/5 to-transparent" />

                    <div className="relative z-10 flex flex-col gap-3 p-4 md:p-5">
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={"Type your idea and we'll build it together."}
                            rows={4}
                            className="min-h-28 w-full resize-none rounded-lg bg-transparent px-2 text-base/6 text-white placeholder:text-white/65 placeholder:font-medium tracking-[-0.005em] border-0 outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none caret-white/80"
                        />

                        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 bg-transparent text-white/90 transition-colors hover:bg-white/5 active:bg-white/10"
                                aria-label="Add attachment"
                            >
                                <IconPlus className="size-4" />
                            </button>

                            <button
                                type="button"
                                className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground ring-1 ring-primary/30 transition-colors hover:bg-primary/90"
                                aria-label="Send"
                            >
                                <IconArrowUp className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditorHero;
