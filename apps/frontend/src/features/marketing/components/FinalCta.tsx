import { ArrowRight, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FinalCta = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden border-t border-border">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-104 w-216 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--primary), transparent)" }}
      />
      <div className="relative mx-auto w-full max-w-310 px-5 py-24 text-center sm:px-8 lg:py-32">
        <h2 className="text-balance-tight mx-auto max-w-2xl text-3xl font-semibold leading-[1.1] text-foreground sm:text-4xl lg:text-[2.75rem]">
          Bring structure to your next incident.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Investigate with evidence, keep humans in control, and preserve the complete incident
          story.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="brand"
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={() => navigate("/signup/account")}
          >
            Request Access
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="subtle" size="lg" className="w-full gap-2 sm:w-auto">
            <BookText className="h-4 w-4" />
            See how it works
          </Button>
        </div>
      </div>
    </section>
  );
};
