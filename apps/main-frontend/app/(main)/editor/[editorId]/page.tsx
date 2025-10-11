"use client";

import React, { useState } from "react";
import { EditorLayout } from "@/components/global/editor/editor-layout";
import { Message } from "@/types";

type EditorPageProps = {
  params: Promise<{ editorId: string }>;
};

// Mock data for UI development
const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Build an e-commerce application in Next.js, keep the images legit, and make the design modern and stylish",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    role: "assistant",
    content: "I'll create a modern e-commerce application with Next.js featuring a clean design, product listings, shopping cart, and checkout flow.",
    createdAt: new Date(Date.now() - 3500000).toISOString(),
    metadata: {
      filesChanged: ["package.json", "app/page.js", "app/products/page.js", "components/ProductCard.js"],
      executionId: "exec_abc123",
    },
  },
  {
    id: "3",
    role: "user",
    content: "Can you implement dark mode and also some individual product pages? If possible go for a landing page as well",
    createdAt: new Date(Date.now() - 2000000).toISOString(),
  },
  {
    id: "4",
    role: "assistant",
    content: "I've added dark mode support with a theme toggle, created individual product detail pages with dynamic routing, and enhanced the landing page with hero sections and featured products.",
    createdAt: new Date(Date.now() - 1900000).toISOString(),
    metadata: {
      filesChanged: ["app/layout.js", "app/products/[id]/page.js", "components/ThemeToggle.js", "components/Hero.js"],
      executionId: "exec_def456",
    },
  },
];

const MOCK_FILES: string[] = [
  "package.json",
  "next.config.js",
  "tailwind.config.js",
  "postcss.config.js",
  "app/globals.css",
  "app/layout.js",
  "app/page.js",
  "app/products/page.js",
  "app/products/[id]/page.js",
  "app/cart/page.js",
  "components/Navbar.js",
  "components/ProductCard.js",
  "components/Hero.js",
  "components/ThemeToggle.js",
  "lib/products.js",
];

const MOCK_PREVIEW_URL = "https://3000-icg65cwhh31yekhb3bkmr.e2b.dev";

// Mock file contents
const MOCK_FILE_CONTENTS: Record<string, string> = {
  "package.json": `{
  "name": "ecommerce-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
  "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig`,
  "app/page.js": `export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedProducts />
      <Newsletter />
    </main>
  )
}`,
  "components/Navbar.js": `'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Store
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/products">Products</Link>
          <Link href="/cart">
            <ShoppingCart className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </nav>
  )
}`,
  "components/Hero.js": `export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our Store</h1>
        <p className="text-xl mb-8">Discover amazing products at great prices</p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold">
          Shop Now
        </button>
      </div>
    </section>
  )
}`,
};

const EditorPage = ({ params }: EditorPageProps) => {
  const p = React.use(params);

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [files] = useState<string[]>(MOCK_FILES);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock message sending
  const handleSendMessage = async (message: string) => {
    setIsGenerating(true);

    // Add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response after 2 seconds
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: "I've processed your request and updated the application accordingly. The changes have been applied to the project.",
        createdAt: new Date().toISOString(),
        metadata: {
          filesChanged: ["app/page.js", "components/NewComponent.js"],
          executionId: `exec_${Math.random().toString(36).substr(2, 9)}`,
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 2000);
  };

  // Mock file content loading
  const handleFileSelect = async (filePath: string): Promise<string | undefined> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return mock content if available, otherwise generate generic content
    return MOCK_FILE_CONTENTS[filePath] || `// ${filePath}\n// This is a placeholder for file content\n\nconsole.log('Hello from ${filePath}');`;
  };

  return (
    <EditorLayout
      messages={messages}
      files={files}
      previewUrl={MOCK_PREVIEW_URL}
      isLoading={isGenerating}
      onSendMessage={handleSendMessage}
      onFileSelect={handleFileSelect}
      projectTitle="E-commerce Next.js App"
    />
  );
};

export default EditorPage;


