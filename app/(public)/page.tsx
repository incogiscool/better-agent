import { Hero } from "@/components/landing/sections/Hero";
import { Logos } from "@/components/landing/sections/Logos";
import { ToolTypes } from "@/components/landing/sections/ToolTypes";
import { Discover } from "@/components/landing/sections/Discover";
import { ComponentsSection } from "@/components/landing/sections/ComponentsSection";
import { DashboardPreview } from "@/components/landing/sections/DashboardPreview";
import { Features } from "@/components/landing/sections/Features";
import { PricingSection } from "@/components/landing/sections/PricingSection";
import { CtaSection } from "@/components/landing/CtaSection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      {/* <Logos /> */}
      <ToolTypes />
      <Discover />
      <ComponentsSection />
      <DashboardPreview />
      <Features />
      <PricingSection />
      <CtaSection />
    </>
  );
}
