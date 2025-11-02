"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check } from "lucide-react";

interface ComingSoonTabProps {
    title: string;
    description: string;
    features: string[];
}

export function ComingSoonTab({ title, description, features }: ComingSoonTabProps) {
    return (
        <Card className="p-12 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10">
                    <Sparkles className="h-12 w-12 text-primary" />
                </div>

                <div>
                    <Badge variant="outline" className="mb-4">Coming Soon</Badge>
                    <h2 className="text-3xl font-bold mb-3">{title}</h2>
                    <p className="text-muted-foreground text-lg">{description}</p>
                </div>

                <div className="grid gap-3 text-left max-w-md mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground">
                    This feature is currently in development. Stay tuned for updates!
                </p>
            </div>
        </Card>
    );
}
