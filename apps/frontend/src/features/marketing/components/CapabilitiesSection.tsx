import { Activity, FileText, GitBranch, Layers, Search, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import {
  TIMELINE,
  SERVICES,
  HUMAN_CONTROLLED_REMEDIATION,
} from "@/features/marketing/fixtures/capabilities-data";

export const CapabilitiesSection = () => {
  return (
    <section id="capabilities" className="relative border-t border-border">
      <div className="mx-auto w-full max-w-310 px-5 py-20 sm:px-8 lg:py-28">
        <SectionHeading
          eyebrow="Capabilities"
          title="One operating surface for the whole incident."
          description="From the first alert to the published postmortem, every step stays in a single, auditable system of record."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-6">
          <article className="rounded-xl border border-border bg-surface p-5 lg:col-span-3">
            <Activity className="h-4 w-4 text-primary-bright" />
            <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-foreground">
              Incident command
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Severity, state, service, responders, and next action in one view. Everyone reads the
              same incident, not five different chat threads.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10.5px]">
              {["INC-1042", "HIGH", "INVESTIGATING", "checkout-api"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-border bg-surface-inset px-2 py-1 text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-surface p-5 lg:col-span-3">
            <Search className="h-4 w-4 text-primary-bright" />
            <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-foreground">
              AI investigation
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              A fixed set of read-only tools gathers evidence, then the agent ranks candidate causes
              with a confidence score you can inspect.
            </p>
            <div className="mt-4 space-y-2">
              {[
                { label: "provider degradation", value: 91 },
                { label: "deployment regression", value: 42 },
                { label: "database exhaustion", value: 18 },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {row.label}
                    </p>

                    <div className="mt-1 h-0.75 overflow-hidden rounded-full bg-surface-raised">
                      <div
                        className="h-full rounded-full bg-primary-bright"
                        style={{ width: `${row.value}%` }}
                      />
                    </div>
                  </div>

                  <span className="font-mono text-[11px] tabular-nums text-foreground">
                    {row.value}%
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
            <GitBranch className="h-4 w-4 text-primary-bright" />

            <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-foreground">
              Timeline and auditability
            </h3>

            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Every state change, tool call, and decision is timestamped and attributable.
            </p>

            <ol className="mt-4 space-y-2 border-l border-border pl-3.5">
              {TIMELINE.map((item) => (
                <li key={item.at} className="relative text-[12.5px] text-muted-foreground">
                  <span className="absolute -left-4.5 top-1.5 h-1.5 w-1.5 rounded-full bg-border" />
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {item.at}
                  </span>{" "}
                  <span className={item.tone}>{item.label}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
            <Layers className="h-4 w-4 text-primary-bright" />

            <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-foreground">
              Service context
            </h3>

            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Ownership, dependencies, and current health travel with the incident.
            </p>

            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border">
              {SERVICES.map((svc) => (
                <li
                  key={svc.name}
                  className="flex items-center justify-between gap-2 bg-surface-inset px-3 py-2"
                >
                  <span className="min-w-0 truncate font-mono text-[11.5px] text-foreground">
                    {svc.name}
                  </span>

                  <span className="font-mono text-[10.5px] text-muted-foreground">{svc.owner}</span>

                  <span className={`font-mono text-[10.5px] ${svc.tone}`}>{svc.state}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
            <ShieldCheck className="h-4 w-4 text-primary-bright" />
            <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-foreground">
              Human-controlled remediation
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Risk-tiered actions with role gates, explicit approval, and scoped execution.
            </p>
            <div className="mt-4 space-y-2 font-mono text-[11px]">
              {HUMAN_CONTROLLED_REMEDIATION.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between rounded-md border border-border bg-surface-inset px-2.5 py-1.5"
                >
                  <span className="text-muted-foreground">{row.key}</span>
                  <span className={row.tone}>{row.value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-surface p-5 lg:col-span-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
              <div>
                <FileText className="h-4 w-4 text-primary-bright" />

                <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-foreground">
                  Postmortems that write themselves from the record
                </h3>

                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  The draft is assembled from real evidence, decisions, and timings, so the review
                  starts from facts instead of memory.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-inset p-4 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
                <p className="text-foreground"># INC-1042 Checkout payment latency spike</p>

                <p className="mt-2">impact: 9m elevated 5xx on POST /v1/payments</p>
                <p>cause: external payment provider degradation</p>
                <p>mitigation: traffic shifted to secondary provider</p>
                <p>detection: 1m 42s · mitigation: 5m 11s</p>
                <p>
                  action items:
                  <span className="text-primary-bright">3 open</span>
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
