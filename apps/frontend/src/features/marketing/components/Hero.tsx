import { useNavigate } from "react-router-dom";
import { ArrowRight, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncidentCommandCenter } from "@/features/marketing/components/incident-command-center";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="grid-backdrop pointer-events-none absolute inset-0 mask-[radial-gradient(120%_70%_at_50%_0%,black,transparent_75%)]" />
      
      <div
        className="pointer-events-none absolute left-1/2 -top-72 h-136 w-5xl -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--primary), transparent)" }}
      />

      <div className="relative mx-auto w-full max-w-310 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Evidence-aware incident response, under human authorization
          </span>

          <h1 className="text-balance-tight mt-6 text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Investigate incidents with evidence, not assumptions.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Causolve helps engineering teams investigate incidents, challenge competing root-cause hypotheses, and recommend the safest next action based on evidence quality, contradictions, and system integrity. Humans authorize every consequential remediation.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="brand" size="lg" className="w-full gap-2 sm:w-auto" onClick={() => navigate("signup/account")}>
              Request Access
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg"  
              className="w-full sm:w-auto justify-center gap-2 items-center"
              onClick={() => navigate("/#how-it-works")}
            >
              <BookText className="h-4 w-4" />
              See how it works
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-5xl sm:mt-16">
          <IncidentCommandCenter />
        </div>

      </div>
    </section>
  );
}

export default Hero;
