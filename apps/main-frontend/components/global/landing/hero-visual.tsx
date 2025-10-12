"use client";

import React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { GlobeConfig } from "@/components/ui/globe";

const DynamicWorld = dynamic(
    () =>
        import("@/components/ui/globe").then((mod) => mod.World as React.ComponentType<{
            globeConfig: GlobeConfig;
            data: GlobeArc[];
        }>),
    { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-muted/40" /> }
);

type GlobeArc = {
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color: string;
};

const GLOBE_ARCS: GlobeArc[] = [
    {
        order: 1,
        startLat: 37.7749,
        startLng: -122.4194,
        endLat: 51.5074,
        endLng: -0.1278,
        arcAlt: 0.2,
        color: "#8b5cf6",
    },
    {
        order: 2,
        startLat: 40.7128,
        startLng: -74.006,
        endLat: 35.6895,
        endLng: 139.6917,
        arcAlt: 0.25,
        color: "#a855f7",
    },
    {
        order: 3,
        startLat: -33.8688,
        startLng: 151.2093,
        endLat: 48.8566,
        endLng: 2.3522,
        arcAlt: 0.18,
        color: "#34d399",
    },
    {
        order: 4,
        startLat: 28.6139,
        startLng: 77.209,
        endLat: 52.52,
        endLng: 13.405,
        arcAlt: 0.22,
        color: "#38bdf8",
    },
    {
        order: 5,
        startLat: -1.2864,
        startLng: 36.8172,
        endLat: 19.4326,
        endLng: -99.1332,
        arcAlt: 0.24,
        color: "#facc15",
    },
];

const GLOBE_CONFIG: GlobeConfig = {
    pointSize: 3,
    globeColor: "#0f172a",
    atmosphereColor: "#3b82f6",
    atmosphereAltitude: 0.22,
    emissive: "#0f172a",
    emissiveIntensity: 0.25,
    shininess: 0.9,
    ambientLight: "#ffffff",
    directionalLeftLight: "#60a5fa",
    directionalTopLight: "#a855f7",
    arcTime: 2800,
    arcLength: 0.9,
    rings: 2,
    maxRings: 4,
    autoRotateSpeed: 0.8,
};

const HIGHLIGHTS = [
    {
        label: "Live Collaboration",
        description: "Pair program with AI in real time",
        position: "top-10 right-6",
    },
    {
        label: "Instant Preview",
        description: "Deploy-ready builds in seconds",
        position: "bottom-16 left-6",
    },
];

export function HeroVisual({ className }: { className?: string }) {
    return (
        <div className={cn("relative flex h-full w-full items-center justify-center", className)}>
            <div className="relative aspect-square w-full max-w-[520px] rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_30px_120px_-40px_rgba(76,29,149,0.65)]">
                <div className="absolute inset-0 rounded-[36px] bg-gradient-to-tr from-primary/20 via-transparent to-primary/5 blur-3xl" />
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/40 backdrop-blur-xl">
                    <DynamicWorld globeConfig={GLOBE_CONFIG} data={GLOBE_ARCS} />
                </div>

                {HIGHLIGHTS.map((highlight) => (
                    <div
                        key={highlight.label}
                        className={cn(
                            "absolute hidden w-52 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur",
                            "shadow-[0_20px_60px_rgba(59,130,246,0.25)] transition-transform duration-500",
                            highlight.position,
                            "lg:block"
                        )}
                    >
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary/90">
                            {highlight.label}
                        </span>
                        <p className="mt-1 text-sm text-slate-100/90">{highlight.description}</p>
                    </div>
                ))}

                <div className="absolute -left-10 bottom-10 hidden rounded-full bg-primary/20 px-6 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/40 backdrop-blur lg:block">
                    <span className="animate-pulse">●</span> 24/7 AI Pair Developer
                </div>
            </div>
        </div>
    );
}
