"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Code2,
    Bug,
    Lightbulb,
    BookOpen,
    Rocket,
    Database,
    Layout,
    Terminal
} from "lucide-react";
import type { SuggestedPrompt } from "@/types/learn";

const suggestedPrompts: SuggestedPrompt[] = [
    {
        title: "Explain a concept",
        description: "Learn about programming concepts",
        prompt: "Can you explain how async/await works in JavaScript with examples?",
        icon: "BookOpen",
    },
    {
        title: "Debug my code",
        description: "Get help fixing issues",
        prompt: "I have a bug in my code. Can you help me debug it?",
        icon: "Bug",
    },
    {
        title: "Best practices",
        description: "Learn industry standards",
        prompt: "What are the best practices for structuring a React application?",
        icon: "Lightbulb",
    },
    {
        title: "Code review",
        description: "Get feedback on your code",
        prompt: "Can you review my code and suggest improvements?",
        icon: "Code2",
    },
    {
        title: "Build a feature",
        description: "Step-by-step guidance",
        prompt: "How do I implement authentication in a Next.js app?",
        icon: "Rocket",
    },
    {
        title: "Database design",
        description: "Schema and query help",
        prompt: "Help me design a database schema for an e-commerce application",
        icon: "Database",
    },
    {
        title: "UI/UX patterns",
        description: "Frontend design patterns",
        prompt: "What are common UI patterns for building responsive dashboards?",
        icon: "Layout",
    },
    {
        title: "CLI & DevOps",
        description: "Terminal and deployment",
        prompt: "How do I set up a CI/CD pipeline with GitHub Actions?",
        icon: "Terminal",
    },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    BookOpen,
    Bug,
    Lightbulb,
    Code2,
    Rocket,
    Database,
    Layout,
    Terminal,
};

interface SuggestedPromptsProps {
    onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {suggestedPrompts.map((item, index) => {
                const IconComponent = iconMap[item.icon] || Code2;
                return (
                    <Card
                        key={index}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 hover:bg-accent/50 group"
                        onClick={() => onSelectPrompt(item.prompt)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <IconComponent className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-medium text-sm truncate">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
