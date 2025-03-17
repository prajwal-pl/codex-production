import CallToAction from "components/landing-page/call-to-action";
import ContentSection from "components/landing-page/content-1";
import Features from "components/landing-page/features-1";
import FooterSection from "components/landing-page/footer";
import HeroSection from "components/landing-page/hero-section";
import StatsSection from "components/landing-page/stats";
import Testimonials from "components/landing-page/testimonials";
import React from "react";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Features />
      <ContentSection />
      <StatsSection />
      <Testimonials />
      <CallToAction />
      <FooterSection />
    </div>
  );
};

export default Home;
