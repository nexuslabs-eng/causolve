import { SectionHeading } from "./SectionHeading";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { STAGES, ACTOR_STYLE, type Actor } from "@/features/marketing/fixtures/lifecycle-data";

export const LifecycleSection = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="how-it-works" className="relative border-t border-border bg-surface-inset/40">
      <div className="mx-auto w-full max-w-310 px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading
            eyebrow="How Causolve works"
            title="One lifecycle, from first signal to what the team learned."
            description="AI participates where judgment benefits from speed: investigation, hypothesis, and recommendation. Consequential actions stay behind a human decision."
          />
          <ul className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
            {(Object.keys(ACTOR_STYLE) as Actor[]).map((actor) => (
              <li key={actor} className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span className={cn("h-1.5 w-1.5 rounded-full", ACTOR_STYLE[actor].dot)} />
                {ACTOR_STYLE[actor].label}
              </li>
            ))}
          </ul>
        </div>

        <div ref={ref} className="relative mt-12">
          {/* horizontal rail on large screens */}
          <div className="pointer-events-none absolute left-0 right-0 top-2.75 hidden h-px bg-border-strong lg:block" />
          
          <div
            className={cn(
              "pointer-events-none absolute left-0 top-2.75 hidden h-px bg-primary transition-[width] duration-1600 ease-out lg:block",
              inView ? "w-full" : "w-0",
            )}
          />

          <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9 lg:gap-x-2">
            {STAGES.map((stage, i) => {
              const style = ACTOR_STYLE[stage.actor];
              return (
                <li
                  key={stage.id}
                  className={cn(
                    "relative pl-6 transition-all duration-500 lg:pl-0",
                    inView ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                  )}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  {/* vertical rail for small screens */}
                  <span className="absolute left-1.25 top-4 h-full w-px bg-border lg:hidden" />
                  <span
                    className={cn(
                      "absolute left-0 top-1 h-2.75 w-2.75 rounded-[3px] border border-background lg:relative lg:top-0 lg:block lg:rotate-45",
                      style.dot,
                    )}
                  />
                  <div className="lg:mt-4 lg:pr-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className={cn("mt-1 text-[14px] font-medium", style.text)}>{stage.label}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                      {stage.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
