import { z } from "zod";
import { IncidentSchema } from "./incident.schema.js";
import { InvestigationSchema } from "../investigations/investigation.schema.js";
import { HypothesisSchema } from "../investigations/hypothesis.schema.js";
import { EvidenceSchema } from "../investigations/evidence.schema.js";
import { EvidenceHypothesisRelationSchema } from "../investigations/evidence-relation.schema.js";
import { InvestigationIntegritySchema } from "../investigations/investigation-integrity.schema.js";
import { CapabilityStateSchema } from "../investigations/capability-state.schema.js";
import { RecommendationSchema } from "../recommendations/recommendation.schema.js";
import { ApprovalPolicySchema } from "../recommendations/approval-policy.schema.js";
import { RemediationSchema } from "../recommendations/remediation.schema.js";
import { VerificationSchema } from "../recommendations/verification.schema.js";

export const IncidentCommandCenterSchema = z.object({
  incident: IncidentSchema,
  investigation: InvestigationSchema.nullable(),
  hypotheses: z.array(HypothesisSchema),
  evidences: z.array(EvidenceSchema),
  relations: z.array(EvidenceHypothesisRelationSchema),
  capabilities: z.array(CapabilityStateSchema),
  integrity: InvestigationIntegritySchema.nullable(),
  recommendation: RecommendationSchema.nullable(),
  approvalPolicy: ApprovalPolicySchema.nullable(),
  remediation: RemediationSchema.nullable(),
  verification: VerificationSchema.nullable(),
});

export const CommandCenterSchema = IncidentCommandCenterSchema;

export type IncidentCommandCenter = z.infer<typeof IncidentCommandCenterSchema>;
export type CommandCenter = IncidentCommandCenter;
