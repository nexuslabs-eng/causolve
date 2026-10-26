import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { EvidenceFeed } from "@/features/marketing/components/incident-command-center/EvidenceFeed";
import { HypothesisList } from "@/features/marketing/components/incident-command-center/HypothesisList";
import { IncidentHeader } from "@/features/marketing/components/incident-command-center/IncidentHeader";
import { InvestigationIntegrity } from "@/features/marketing/components/incident-command-center/InvestigationIntegrity";
import { RecommendationPanel } from "@/features/marketing/components/incident-command-center/RecommendationPanel";
import {
  useCountUp,
  useEvidenceTimeline,
} from "@/features/marketing/hooks/use-command-center-timeline";
import {
  APPROVAL_POLICY,
  EVIDENCE,
  EVIDENCE_RELATIONS,
  HYPOTHESES,
  INCIDENT,
  INVESTIGATION,
  INVESTIGATION_INTEGRITY,
  RANKING_CHANGES,
  RECOMMENDATION,
  SERVICE,
  getHypothesisById,
} from "@/features/marketing/fixtures/incident-mock";

export const IncidentCommandCenter = () => {
  const reduced = useReducedMotion();
  const revealed = useEvidenceTimeline(EVIDENCE.length, reduced);
  const running = revealed < EVIDENCE.length;
  const settled = revealed >= EVIDENCE.length;
  const coverage = useCountUp(INVESTIGATION_INTEGRITY.evidenceCoverage, settled, reduced);
  const leadingHypothesis = INVESTIGATION.leadingHypothesisId
    ? getHypothesisById(INVESTIGATION.leadingHypothesisId)
    : undefined;

  return (
    <section
      aria-label="Causolve incident command center preview"
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-(--shadow-elevated)"
    >
      <IncidentHeader incident={INCIDENT} service={SERVICE} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="border-b border-border px-4 py-4 sm:px-5 lg:border-b-0 lg:border-r">
          <HypothesisList
            evidence={EVIDENCE}
            hypotheses={HYPOTHESES}
            rankingChanges={RANKING_CHANGES}
            reduced={reduced}
            revealed={revealed}
            running={running}
          />
          
          <EvidenceFeed
            evidence={EVIDENCE}
            hypotheses={HYPOTHESES}
            relations={EVIDENCE_RELATIONS}
            revealed={revealed}
          />
        </div>

        <div className="px-4 py-4 sm:px-5">
          <InvestigationIntegrity
            coverage={coverage}
            integrity={INVESTIGATION_INTEGRITY}
            settled={settled}
          />
          <RecommendationPanel
            approvalPolicy={APPROVAL_POLICY}
            leadingHypothesis={leadingHypothesis}
            recommendation={RECOMMENDATION}
            reduced={reduced}
            settled={settled}
          />
        </div>
      </div>
    </section>
  );
};
