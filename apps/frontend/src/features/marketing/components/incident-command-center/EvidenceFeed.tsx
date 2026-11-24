import type { Evidence } from "contracts/investigations/evidence.schema";
import type { EvidenceHypothesisRelation } from "contracts/investigations/evidence-relation.schema";
import type { Hypothesis } from "contracts/investigations/hypothesis.schema";
import { Check, MinusCircle, Terminal, XCircle } from "lucide-react";
import {
  getEvidenceDetail,
  getEvidenceQuality,
  getEvidenceSourceLabel,
} from "@/features/marketing/fixtures/incident-mock";
import { cn } from "@/lib/utils";

type EvidenceRelation = EvidenceHypothesisRelation["relation"];

interface EvidenceFeedProps {
  evidence: Evidence[];
  hypotheses: Hypothesis[];
  relations: EvidenceHypothesisRelation[];
  revealed: number;
}

const relationStyles: Record<EvidenceRelation, string> = {
  SUPPORTS: "text-success",
  CONTRADICTS: "text-critical",
  NEUTRAL: "text-muted-foreground",
};

const RelationIcon = ({
  relation,
  className,
}: {
  relation: EvidenceRelation;
  className?: string;
}) => {
  const classes = cn(className, relationStyles[relation]);

  if (relation === "SUPPORTS") return <Check className={classes} />;
  if (relation === "CONTRADICTS") return <XCircle className={classes} />;

  return <MinusCircle className={classes} />;
};

export const EvidenceFeed = ({ evidence, hypotheses, relations, revealed }: EvidenceFeedProps) => (
  <div className="mt-5 border-t border-border pt-3">
    <p className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
      <Terminal className="h-3 w-3" />
      evidence and relationships
    </p>

    <div className="mt-2.5 space-y-2">
      {evidence.map((item, index) => {
        const evidenceRelation = relations.find((relation) => relation.evidenceId === item.id);

        if (!evidenceRelation) return null;

        const relatedHypothesis = hypotheses.find(
          (hypothesis) => hypothesis.id === evidenceRelation.hypothesisId,
        );

        return (
          <article
            key={item.id}
            className={cn(
              "rounded-lg border bg-surface-raised px-3 py-2.5 transition-opacity",
              evidenceRelation.relation === "CONTRADICTS" ? "border-critical/25" : "border-border",
              index < revealed ? "animate-rise opacity-100" : "opacity-0",
            )}
            aria-hidden={index < revealed ? undefined : true}
          >
            <div className="flex items-start gap-2">
              <RelationIcon
                relation={evidenceRelation.relation}
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
              />

              <div className="min-w-0">
                <p className="text-[12.5px] font-medium leading-tight text-foreground">
                  {item.observation}
                </p>

                <p className="mt-1 truncate font-mono text-[10.5px] text-muted-foreground">
                  {getEvidenceSourceLabel(item)} - {getEvidenceDetail(item)}
                </p>

                <p className="mt-1 font-mono text-[10px] tracking-wider">
                  <span className={relationStyles[evidenceRelation.relation]}>
                    {evidenceRelation.relation}
                  </span>

                  <span className="text-muted-foreground">
                    {" "}
                    {relatedHypothesis?.reference} - quality {getEvidenceQuality(item)}
                  </span>
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  </div>
);
