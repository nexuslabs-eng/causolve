import type { Evidence } from "contracts/investigations/evidence.schema";
import type { Hypothesis } from "contracts/investigations/hypothesis.schema";
import type { HypothesisStatus } from "contracts/common/enums";
import type { HypothesisRankingChange } from "contracts/investigations/ranking-change.schema";
import { BadgeCheck, Loader2 } from "lucide-react";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { cn } from "@/lib/utils";

interface HypothesisListProps {
  evidence: Evidence[];
  hypotheses: Hypothesis[];
  rankingChanges: HypothesisRankingChange[];
  reduced: boolean;
  revealed: number;
  running: boolean;
}

const stateStyles: Record<HypothesisStatus, string> = {
  LEADING: "border-success/40 bg-success/10 text-success",
  PLAUSIBLE: "border-info/35 bg-info/10 text-info",
  CANDIDATE: "border-border-strong bg-surface-inset text-muted-foreground",
  WEAKENED: "border-caution/35 bg-caution/10 text-caution",
  INVALIDATED: "border-critical/35 bg-critical/10 text-critical",
  CONFIRMED: "border-success/40 bg-success/10 text-success",
};

const initialStateFor = (
  hypothesis: Hypothesis,
  rankingChanges: HypothesisRankingChange[],
): HypothesisStatus =>
  rankingChanges.find((change) => change.hypothesisId === hypothesis.id)?.previousStatus ??
  hypothesis.status;

const stateAt = (
  hypothesis: Hypothesis,
  evidence: Evidence[],
  rankingChanges: HypothesisRankingChange[],
  revealed: number,
): HypothesisStatus => {
  const revealedEvidenceIds = new Set(evidence.slice(0, revealed).map((item) => item.id));

  return rankingChanges
    .filter((change) => change.hypothesisId === hypothesis.id)
    .reduce(
      (status, change) =>
        change.triggeringEvidenceIds.every((evidenceId) => revealedEvidenceIds.has(evidenceId))
          ? change.newStatus
          : status,
      initialStateFor(hypothesis, rankingChanges),
    );
};

export const HypothesisList = ({
  evidence,
  hypotheses,
  rankingChanges,
  reduced,
  revealed,
  running,
}: HypothesisListProps) => (
  <>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-primary-bright">
        <ResolutionNode className="h-4" active={running && !reduced} />
        <span className="text-[12.5px] font-medium text-foreground">Competing hypotheses</span>
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">
        {running ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className={cn("h-3 w-3", !reduced && "animate-spin")} />
            weighing evidence
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-success">
            <BadgeCheck className="h-3 w-3" />
            ranked
          </span>
        )}
      </span>
    </div>

    <ol className="mt-4 space-y-2.5">
      {hypotheses.map((hypothesis) => {
        const initialState = initialStateFor(hypothesis, rankingChanges);
        const state = stateAt(hypothesis, evidence, rankingChanges, revealed);
        const revised = state !== initialState;

        return (
          <li
            key={hypothesis.id}
            className={cn(
              "rounded-lg border bg-surface-raised px-3 py-2.5 transition-colors duration-500",
              state === "LEADING" ? "border-success/30" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10.5px] tracking-wider text-muted-foreground">
                  {hypothesis.reference}
                </p>
                <p className="mt-0.5 text-[12.5px] font-medium leading-tight text-foreground">
                  {hypothesis.statement}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider transition-colors duration-500",
                  stateStyles[state],
                )}
              >
                {state}
              </span>
            </div>
            {revised ? (
              <p className="mt-1.5 font-mono text-[10.5px] text-muted-foreground">
                revised: {initialState} to {state}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  </>
);
