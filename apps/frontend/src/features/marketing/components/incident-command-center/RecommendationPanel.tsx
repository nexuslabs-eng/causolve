import type { ApprovalPolicy, Hypothesis, Recommendation } from "contracts";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApprovalSummary } from "@/features/marketing/fixtures/incident-mock";
import { cn } from "@/lib/utils";

interface RecommendationPanelProps {
  approvalPolicy: ApprovalPolicy;
  leadingHypothesis?: Hypothesis;
  recommendation: Recommendation;
  reduced: boolean;
  settled: boolean;
}

export const RecommendationPanel = ({
  approvalPolicy,
  leadingHypothesis,
  recommendation,
  reduced,
  settled,
}: RecommendationPanelProps) => (
  <>
    <div
      className={cn(
        "mt-3 rounded-lg border border-primary/25 bg-primary/[0.06] p-4 transition-opacity",
        settled ? "animate-rise opacity-100" : "opacity-0",
      )}
      style={settled && !reduced ? { animationDelay: "160ms" } : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
          recommended action
        </p>
        <span className="inline-flex items-center gap-1 rounded border border-caution/30 bg-caution/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-caution">
          RISK {recommendation.technicalRisk}
        </span>
      </div>

      <p className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
        {recommendation.summary}
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 font-mono text-[10.5px]">
        <div>
          <dt className="text-muted-foreground">blast radius</dt>
          <dd className="mt-0.5 text-foreground">{recommendation.blastRadius}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">leading hypothesis</dt>
          <dd className="mt-0.5 text-foreground">{leadingHypothesis?.statement}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">authorization</dt>
          <dd className="mt-0.5 text-foreground">{getApprovalSummary(approvalPolicy)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="brand" size="sm" className="gap-1.5">
          Review remediation
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="subtle" size="sm">
          View investigation history
        </Button>
      </div>
    </div>

    <p className="mt-3 text-center font-mono text-[10.5px] tracking-wide text-muted-foreground">
      AI recommends · humans authorize · Causolve enforces
    </p>
  </>
);
