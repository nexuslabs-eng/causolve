import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";
import { IncidentSchema } from "../incidents/incident.schema.js";
import { EvidenceSchema } from "../investigations/evidence.schema.js";
import { HypothesisSchema } from "../investigations/hypothesis.schema.js";
import { HypothesisRankingChangeSchema } from "../investigations/ranking-change.schema.js";
import { InvestigationIntegritySchema } from "../investigations/investigation-integrity.schema.js";
import { RecommendationSchema } from "../recommendations/recommendation.schema.js";
import { ApprovalSchema } from "../recommendations/approval.schema.js";
import { RemediationSchema } from "../recommendations/remediation.schema.js";
import { VerificationSchema } from "../recommendations/verification.schema.js";

const BaseEventSchema = z.object({
    id: IdSchema,
    organizationId: IdSchema,
    incidentId: IdSchema,
    timestamp: DateTimeSchema,
});

export const IncidentUpdatedEventSchema = BaseEventSchema.extend({
    type: z.literal("incident.updated"),
    payload: IncidentSchema,
});

export const InvestigationStartedEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.started"),
    payload: z.object({
        investigationId: IdSchema
    })
});

export const ToolStartedEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.tool_started"),
    payload: z.object({
        investigationId: IdSchema,
        toolName: z.string(),
    }),
});

export const ToolFailedEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.tool_failed"),
    payload: z.object({
        investigationId: IdSchema,
        toolName: z.string(),
        error: z.string(),
    }),
});

export const EvidenceAddedEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.evidence_added"),
    payload: EvidenceSchema,
});

export const HypothesisUpdatedEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.hypothesis_updated"),
    payload: HypothesisSchema,
});

export const RankingChangedEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.ranking_changed"),
    payload: HypothesisRankingChangeSchema,
});

export const IntegrityChangedEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.integrity_changed"),
    payload: InvestigationIntegritySchema,
});

export const RecommendationReadyEventSchema = BaseEventSchema.extend({
    type: z.literal("investigation.recommendation_ready"),
    payload: RecommendationSchema,
});

export const ApprovalCompletedEventSchema = BaseEventSchema.extend({
    type: z.literal("approval.completed"),
    payload: ApprovalSchema,
});

export const RemediationStartedEventSchema = BaseEventSchema.extend({
    type: z.literal("remediation.started"),
    payload: RemediationSchema,
});

export const RemediationCompletedEventSchema = BaseEventSchema.extend({
    type: z.literal("remediation.completed"),
    payload: RemediationSchema,
});

export const VerificationCompletedEventSchema = BaseEventSchema.extend({
    type: z.literal("verification.completed"),
    payload: VerificationSchema,
});

export const IncidentResolvedEventSchema = BaseEventSchema.extend({
    type: z.literal("incident.resolved"),
    payload: IncidentSchema,
});

export const EventSchema = z.discriminatedUnion("type", [
    IncidentUpdatedEventSchema,
    InvestigationStartedEventSchema,
    ToolStartedEventSchema,
    ToolFailedEventSchema,
    EvidenceAddedEventSchema,
    HypothesisUpdatedEventSchema,
    RankingChangedEventSchema,
    IntegrityChangedEventSchema,
    RecommendationReadyEventSchema,
    ApprovalCompletedEventSchema,
    RemediationStartedEventSchema,
    RemediationCompletedEventSchema,
    VerificationCompletedEventSchema,
    IncidentResolvedEventSchema,
]);

export type Event = z.infer<typeof EventSchema>;
