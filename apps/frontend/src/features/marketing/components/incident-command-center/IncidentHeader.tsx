import type { Incident, Service } from "contracts";
import { Activity, CircleDot, ShieldAlert } from "lucide-react";
import { getIncidentOpenedLabel } from "@/features/marketing/fixtures/incident-mock";

interface IncidentHeaderProps {
  incident: Incident;
  service: Service;
}

export const IncidentHeader = ({ incident, service }: IncidentHeaderProps) => (
  <>
    <div className="flex items-center gap-3 border-b border-border bg-surface-inset px-4 py-2.5">
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-muted-foreground/65 animate-pulse" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/45 animate-pulse delay-1" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse delay-2" />
      </div>
      <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
        causolve.app / incidents / {incident.reference}
      </span>
      <span className="ml-auto hidden items-center gap-1.5 font-mono text-[11px] text-muted-foreground sm:flex">
        <Activity className="h-3 w-3 text-success" />
        live
      </span>
    </div>

    <div className="flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-border px-4 py-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground">
            {incident.reference}
          </span>
          <span className="h-3 w-px bg-border-strong" />
          <span className="font-mono text-[11px] text-muted-foreground">{service.name}</span>
          <span className="h-3 w-px bg-border-strong" />
          <span className="font-mono text-[11px] text-muted-foreground">
            opened {getIncidentOpenedLabel(incident.startedAt)}
          </span>
        </div>
        <h3 className="mt-1.5 truncate text-[17px] font-semibold tracking-[-0.02em] text-foreground">
          {incident.title}
        </h3>
      </div>

      <div className="flex max-sm:flex-col sm:items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded border border-high/35 bg-high/10 px-2 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-high">
          <ShieldAlert className="h-3 w-3" />
          {incident.severity}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded border border-info/30 bg-info/10 px-2 py-1 font-mono text-[10.5px] font-semibold tracking-wider text-info">
          <CircleDot className="h-3 w-3" />
          {incident.status}
        </span>
      </div>
    </div>
  </>
);
