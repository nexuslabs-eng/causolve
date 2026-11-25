import { lazy } from "react";
import Hero from "@/features/marketing/components/Hero";

const ProblemSection = lazy(async () => {
  const module = await import("@/features/marketing/components/ProblemSection");
  return { default: module.ProblemSection };
});

const LifecycleSection = lazy(async () => {
  const module = await import("@/features/marketing/components/LifecycleSection");
  return { default: module.LifecycleSection };
});

const InvestigationSection = lazy(async () => {
  const module = await import("@/features/marketing/components/InvestigationSection");
  return { default: module.InvestigationSection };
});

const ControlSection = lazy(async () => {
  const module = await import("@/features/marketing/components/ControlSection");
  return { default: module.ControlSection };
});

const CapabilitiesSection = lazy(async () => {
  const module = await import("@/features/marketing/components/CapabilitiesSection");
  return { default: module.CapabilitiesSection };
});

const FinalCta = lazy(async () => {
  const module = await import("@/features/marketing/components/FinalCta");
  return { default: module.FinalCta };
});

const HomePage = () => {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <LifecycleSection />
      <InvestigationSection />
      <ControlSection />
      <CapabilitiesSection />
      <FinalCta />
    </main>
  );
};

export default HomePage;
