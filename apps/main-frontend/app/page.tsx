import React from "react";
import { HeroSection } from "@/components/global/landing/hero-section";
import { FeaturesSection } from "@/components/global/landing/features-section";
import { HowItWorksSection } from "@/components/global/landing/how-it-works-section";
import { StatsSection } from "@/components/global/landing/stats-section";
import { CTASection } from "@/components/global/landing/cta-section";
import { Footer } from "@/components/global/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
