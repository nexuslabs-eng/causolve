import { useEffect, useState } from "react";
import { Check, CircleSlash, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { GATES, getTrail, type Decision } from "@/features/marketing/fixtures/control-data";

export const ControlSection = () => {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [decision, setDecision] = useState<Decision>("pending");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!inView || reduced) return;

    const timeout = window.setTimeout(() => setRevealed(true), 200);

    return () => window.clearTimeout(timeout);
  }, [inView, reduced]);

  const visible = reduced && inView ? true : revealed;
  const trail = getTrail(decision);

  return (
    <section id="control" className="relative border-t border-border bg-surface-inset/40">
      <div className="mx-auto w-full max-w-310 px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Human control"
          title="AI recommends. Humans authorize. Causolve enforces."
          description="Consequential remediation never runs on model confidence alone. Every action is bound to a policy, a role, an approver, and a permanent record."
        />

        <div
          ref={ref}
          className={cn(
            "mt-10 grid gap-6 transition-all duration-500 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-elevated)">
            <div className="flex items-center gap-2 border-b border-border bg-surface-inset px-4 py-2.5">

              <ShieldCheck className="h-3.5 w-3.5 text-primary-bright" />

              <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
                authorization / INC-1042 / remediation request
              </span>

              <span
                className={cn(
                  "ml-auto rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                  decision === "approved"
                    ? "border-success/40 bg-success/10 text-success"
                    : decision === "rejected"
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-warning/40 bg-warning/10 text-warning",
                )}
              >
                {decision === "pending" ? "awaiting approval" : decision}
              </span>

            </div>

            <div className="px-4 py-5 sm:px-5">
              
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                recommended action
              </p>

              <p className="mt-2 text-[17px] font-semibold tracking-[-0.01em] text-foreground">
                Shift payment traffic to the secondary provider
              </p>

              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "risk level", v: "MEDIUM", tone: "text-warning" },
                  { k: "blast radius", v: "SERVICE", tone: "text-foreground" },
                  { k: "required role", v: "incident_commander", tone: "text-primary-bright" },
                ].map((item) => (
                  <div key={item.k} className="rounded-lg border border-border bg-surface-inset px-3 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {item.k}
                    </dt>
                    <dd className={cn("mt-1 truncate font-mono text-[12.5px] font-medium", item.tone)}>
                      {item.v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border bg-surface-inset px-3 py-2.5">

                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                  Execution is blocked until an authorized approver decides. The agent cannot bypass
                  this gate, escalate its own permissions, or retry silently.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setDecision(decision === "approved" ? "pending" : "approved")}
                  aria-pressed={decision === "approved"}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-[13px] font-medium transition-colors",
                    decision === "approved"
                      ? "border-success/50 bg-success/15 text-success"
                      : "border-primary/50 bg-primary/10 text-primary-bright hover:bg-primary/20",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  {decision === "approved" ? "Execution authorized" : "Approve execution"}
                </button>

                <button
                  type="button"
                  onClick={() => setDecision(decision === "rejected" ? "pending" : "rejected")}
                  aria-pressed={decision === "rejected"}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-[13px] font-medium transition-colors",
                    decision === "rejected"
                      ? "border-destructive/50 bg-destructive/15 text-destructive"
                      : "border-border bg-surface-raised text-muted-foreground hover:text-foreground",
                  )}
                >
                  <CircleSlash className="h-3.5 w-3.5" />
                  {decision === "rejected" ? "Execution rejected" : "Reject"}
                </button>
              </div>
            </div>

            <div className="border-t border-border bg-surface-inset px-4 py-4 sm:px-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                audit trail
              </p>

              <ol className="mt-3 space-y-2.5" aria-live="polite">
                {trail.map((entry) => (
                  <li key={entry.at + entry.actor + entry.event} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{entry.at}</span>
                    <span className="min-w-0 text-[12.5px] leading-relaxed text-muted-foreground">
                      <span className="font-mono text-[11.5px] text-foreground">{entry.actor}</span>{" "}
                      {entry.event}
                    </span>
                  </li>
                ))}
              </ol>

            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5 text-primary-bright" />
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                who can do what
              </p>
            </div>

            <ul className="mt-4 space-y-3">
              {GATES.map((gate) => (
                <li key={gate.role} className="rounded-lg border border-border bg-surface-inset p-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13.5px] font-medium text-foreground">{gate.label}</p>
                    <span className="font-mono text-[10.5px] text-muted-foreground">{gate.role}</span>
                  </div>

                  <p className="mt-2 flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    {gate.allowed}
                  </p>

                  <p className="mt-1.5 flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {gate.blocked}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
