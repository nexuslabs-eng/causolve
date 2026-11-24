import type { InvestigationIntegrity as InvestigationIntegrityData } from "contracts/investigations/investigation-integrity.schema";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestigationIntegrityProps {
  coverage: number;
  integrity: InvestigationIntegrityData;
  settled: boolean;
}

export const InvestigationIntegrity = ({
  coverage,
  integrity,
  settled,
}: InvestigationIntegrityProps) => (
  <div
    className={cn(
      "rounded-lg border border-caution/25 bg-surface-raised p-4 transition-opacity",
      settled ? "animate-rise opacity-100" : "opacity-0",
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
          investigation integrity
        </p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.01em] text-caution">
          <AlertTriangle className="h-4 w-4" />
          {integrity.level}
        </p>
        <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
          {integrity.reasons[0]}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
          evidence coverage
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {coverage}%
        </p>
      </div>
    </div>

    <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-surface-inset">
      <div
        className="h-full rounded-full bg-caution transition-[width] duration-700 ease-out"
        style={{ width: `${coverage}%` }}
      />
    </div>
  </div>
);
