import Hero from "@/features/marketing/components/Hero";
import { ProblemSection } from "@/features/marketing/components/ProblemSection";
import { LifecycleSection } from "@/features/marketing/components/LifecycleSection";
import { InvestigationSection } from "@/features/marketing/components/InvestigationSection";
import { ControlSection } from "@/features/marketing/components/ControlSection";
import { CapabilitiesSection } from "@/features/marketing/components/CapabilitiesSection";
import { FinalCta } from "@/features/marketing/components/FinalCta";

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
