import { AlertTriangle, Clock, ShieldOff } from "lucide-react";
import { SectionHeading } from "@/features/marketing/components/SectionHeading";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

const SOURCES = [
  "metrics",
  "logs",
  "traces",
  "deployments",
  "runtime state",
  "service topology",
];

const PAINS = [
  {
    icon: AlertTriangle,
    title: "Fragmented evidence",
    body: "Context lives in six tools. Nobody holds the full picture at minute three of an outage.",
  },
  {
    icon: Clock,
    title: "Slow diagnosis",
    body: "Engineers correlate deploys, logs, and metrics by hand while the impact keeps compounding.",
  },
  {
    icon: ShieldOff,
    title: "Unsafe remediation",
    body: "Fixes get applied from memory, without risk framing, approval, or a record of what happened.",
  },
];

export const ProblemSection = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="product" className="relative border-t border-border">
      <div className="mx-auto w-full max-w-310 px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The incident gap"
              title={
                <>
                  Production incidents are not a lack-of-data problem. They are a coordination and
                  decision problem.
                </>
              }
              description="Every signal you need already exists somewhere. The cost is in correlating it under pressure, agreeing on a cause, and deciding what is safe to do next."
            />

            <div className="mt-9 space-y-5">
              {PAINS.map((pain) => (
                <div key={pain.title} className="flex gap-4 border-l border-border pl-4">
                  <pain.icon className="mt-0.5 h-4 w-4 shrink-0 text-high" />
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-medium text-foreground">{pain.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                      {pain.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Convergence composition */}
          <div
            ref={ref}
            className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-(--shadow-panel) sm:p-7"
          >
            <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70 mask-[radial-gradient(80%_70%_at_70%_50%,black,transparent)]" />
            <p className="relative font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              signal convergence
            </p>

            <div className="relative mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:gap-8">
              <ul className="space-y-2.5">
                {SOURCES.map((source, i) => (
                  <li
                    key={source}
                    className={cn(
                      "flex items-center gap-3 transition-all duration-500",
                      inView ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                    )}
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-bright/70" />
                    <span className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface-inset px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
                      {source}
                    </span>
                    <span className="hidden h-px w-8 shrink-0 bg-border-strong sm:block" />
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-center gap-3 text-primary-bright">
                <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-4">
                  <ResolutionNode className="h-8" active={inView} />
                </div>
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  one resolution path
                </p>
              </div>
            </div>

            <p className="relative mt-7 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
              Causolve pulls the operational signals into a single incident record, ranks what
              actually matters, and turns it into a decision an engineer can authorize.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
