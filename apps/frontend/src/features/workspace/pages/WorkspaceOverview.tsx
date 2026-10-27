import { ArrowUpRight, CheckCircle2, Clock3, ShieldCheck, Siren } from "lucide-react";
import { commandCenterFixture } from "@/mocks/fixtures/command-center";

const { incident, investigation, approvalPolicy } = commandCenterFixture;

const summary = [
  { label: "Active incidents", value: "1", detail: `${incident.severity} severity`, icon: Siren, tone: "text-high" },
  { label: "Investigations in progress", value: investigation ? "1" : "0", detail: "Evidence collection active", icon: Clock3, tone: "text-info" },
  { label: "Awaiting authorization", value: approvalPolicy?.satisfied ? "0" : "1", detail: "Human review required", icon: ShieldCheck, tone: "text-caution" },
  { label: "Recovered today", value: "0", detail: "No verified recoveries", icon: CheckCircle2, tone: "text-success" },
];

const incidents = [
  { id: incident.reference, title: incident.title, severity: incident.severity, service: "payment-api", status: "Investigating", started: "38m ago" },
];

const activity = [
  { time: "11:04", title: "Authorization requested", detail: "Traffic shift recommended for INC-1042" },
  { time: "10:52", title: "Evidence coverage changed", detail: "INC-1042 coverage is now 72%" },
  { time: "10:31", title: "Recovery verified", detail: "All checks passed for INC-1038" },
];

function Severity({ value }: { value: string }) {
  return <span className={value === "HIGH" ? "font-mono text-[11px] font-semibold text-high" : "font-mono text-[11px] font-semibold text-caution"}>{value}</span>;
}

export function WorkspaceOverview() {
  return (
    <div className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase text-primary-bright">Causolve workspace</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Operational context across your workspace.</p>
        </div>
          <p className="font-mono text-[11px] text-muted-foreground">Updated moments ago</p>
      </div>

      <section aria-label="Operational summary" className="grid border-b border-border grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, detail, icon: Icon, tone }, index) => (
          <div key={label} className={`py-5 px-5 ${index > 0 ? "border-border border-t-0" : ""} ${index % 2 === 1 ? "sm:border-l" : ""} ${index > 1 ? "sm:border-t xl:border-t-0" : ""} ${index > 0 ? "xl:border-l" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <Icon className={`size-4 ${tone}`} />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-8 py-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="active-incidents-heading">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 id="active-incidents-heading" className="text-sm font-semibold text-foreground">Active incidents</h2>
              <p className="mt-1 text-xs text-muted-foreground">Open operational events requiring coordination.</p>
            </div>
            <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-primary-bright outline-none hover:text-primary focus-visible:ring-1 focus-visible:ring-ring">
              View all <ArrowUpRight className="size-3.5" />
            </button>
          </div>

          <div className="hidden overflow-hidden rounded-md border border-border md:block">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-surface-inset text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Incident</th>
                  <th className="px-3 py-2.5 font-medium">Severity</th>
                  <th className="px-3 py-2.5 font-medium">Service</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 text-right font-medium">Started</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="border-t border-border bg-surface transition-colors hover:bg-surface-raised">
                    <td className="max-w-85 px-3 py-3">
                      <span className="font-mono text-[10px] text-muted-foreground">{incident.id}</span>
                      <span className="ml-2 font-medium text-foreground">{incident.title}</span>
                    </td>
                    <td className="px-3 py-3"><Severity value={incident.severity} /></td>
                    <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">{incident.service}</td>
                    <td className="px-3 py-3 text-foreground">{incident.status}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{incident.started}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {incidents.map((incident) => (
              <article key={incident.id} className="rounded-md border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground">{incident.id}</span>
                  <Severity value={incident.severity} />
                </div>
                <h3 className="mt-2 text-sm font-medium text-foreground">{incident.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-mono">{incident.service}</span><span>{incident.status}</span><span>{incident.started}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="recent-activity-heading" className="xl:border-l xl:border-border xl:pl-7">
          <h2 id="recent-activity-heading" className="text-sm font-semibold text-foreground">Recent activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">Investigation and authorization history.</p>
          <ol className="mt-4">
            {activity.map((item, index) => (
              <li key={item.time} className="relative grid grid-cols-[42px_1fr] gap-3 pb-5 last:pb-0">
                {index < activity.length - 1 && <span className="absolute bottom-0 left-5 top-5 w-px bg-border" />}
                <span className="font-mono text-[10px] text-muted-foreground">{item.time}</span>
                <div>
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
