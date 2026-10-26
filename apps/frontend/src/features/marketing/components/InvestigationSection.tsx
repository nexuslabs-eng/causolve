import { useEffect, useState } from "react";
import { Check, Loader2, Lock, Terminal } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { TOOLS, POINTS } from "@/features/marketing/fixtures/investigation-data";


export const InvestigationSection = () => {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    const resetTimer = window.setTimeout(() => setDone(0), 0);
    const timers = TOOLS.map((_, i) =>
      window.setTimeout(() => setDone(i + 1), 1240 * (i + 1)),
    );

    return () => {
      window.clearTimeout(resetTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView, reduced]);

  const visibleDone = reduced && inView ? TOOLS.length : done;
  const complete = visibleDone >= TOOLS.length;

  return (
    <section className="relative border-t border-border">
      <div className="mx-auto w-full max-w-310 px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading   
              eyebrow="AI investigation"
              title="Investigation through controlled capabilities, not open-ended access."
              description="Causolve gives the investigation agent a fixed set of read-only capabilities. It runs them in sequence, records what each returned, and assembles a structured hypothesis from the results."
            />
            
            <ul className="mt-8 space-y-3.5">
              {POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-bright" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div
            ref={ref}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-elevated)"
          >
            <div className="flex items-center gap-2 border-b border-border bg-surface-inset px-4 py-2.5">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
                investigation / INC-1042 / capabilities
              </span>
              <span
                className={cn(
                  "ml-auto font-mono text-[10.5px]",
                  complete ? "text-success" : "text-muted-foreground",
                )}
              >
                {complete ? "6 / 6 complete" : `${visibleDone} / ${TOOLS.length} running`}
              </span>
            </div>

            <ol className="divide-y divide-border">
              {TOOLS.map((tool, index) => {
                const finished = index < visibleDone;
                const active = index === visibleDone;
                return (
                  <li
                    key={tool.name}
                    className={cn(
                      "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 px-4 py-3 transition-colors duration-300 sm:px-5",
                      active && "bg-primary/4",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border",
                        finished
                          ? "border-success/40 bg-success/15 text-success"
                          : active
                            ? "border-primary/50 bg-primary/10 text-primary-bright"
                            : "border-border text-muted-foreground",
                      )}
                    >
                      {finished ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : active ? (
                        <Loader2 className={cn("h-2.5 w-2.5", !reduced && "animate-spin")} />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-current" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-mono text-[12px] text-foreground">
                        {tool.name}
                        <span className="text-muted-foreground">
                          ({tool.args})
                        </span>
                      </p>

                      <p
                        className={cn(
                          "mt-1 font-mono text-[10.5px] transition-opacity duration-300",
                          finished ? "text-success/90 opacity-100" : "text-muted-foreground opacity-60",
                        )}
                      >
                        {finished ? `→ ${tool.result}` : active ? "executing" : "queued"}
                      </p>

                    </div>
                  </li>
                );
              })}
            </ol>

            <div
              className={cn(
                "border-t border-border bg-surface-inset px-4 py-4 transition-opacity duration-500 sm:px-5",
                complete ? "opacity-100" : "opacity-30",
              )}
            >
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                structured hypothesis
              </p>

              <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                    External payment provider degradation is leading
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    Provider latency and incident history support H2. A controlled comparison
                    weakens the deployment hypothesis while Log Search remains unavailable.
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    confidence
                  </p>
                  <p className="font-mono text-xl font-semibold tabular-nums text-primary-bright">
                    {complete ? "91%" : "--"}
                  </p>
                </div>

              </div>

              <div className="mt-3 h-0.75 w-full overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-primary-bright transition-[width] duration-700 ease-out"
                  style={{ width: complete ? "91%" : "0%" }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
