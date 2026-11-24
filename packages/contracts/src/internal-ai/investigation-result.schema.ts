import { z } from "zod";
import { RecommendationActionTypeSchema, TechnicalRiskSchema } from "../common/enums.js";
import { IdSchema, NonEmptyStringSchema } from "../common/primitives.js";

export const AIHypothesisProposalSchema = z.object({
  reference: z
    .string()
    .trim()
    .regex(/^H\d+$/),
  statement: NonEmptyStringSchema,
});

export const AIEvidenceInterpretationSchema = z.object({
  evidenceId: IdSchema,
  hypothesisReference: z
    .string()
    .trim()
    .regex(/^H\d+$/),
  relation: z.enum(["SUPPORTS", "CONTRADICTS", "NEUTRAL"]),
  reasoning: NonEmptyStringSchema,
});

export const AIRecommendationProposalSchema = z.object({
  actionType: RecommendationActionTypeSchema,
  summary: NonEmptyStringSchema,
  reasoning: NonEmptyStringSchema,
  technicalRisk: TechnicalRiskSchema,
  supportingEvidenceIds: z.array(IdSchema),
  contradictingEvidenceIds: z.array(IdSchema),
});

export const AIInvestigationResultSchema = z.object({
  investigationId: IdSchema,
  status: z.enum(["COMPLETED", "DEGRADED", "FAILED"]),
  hypothesisProposals: z.array(AIHypothesisProposalSchema),
  evidenceInterpretations: z.array(AIEvidenceInterpretationSchema),
  recommendationProposal: AIRecommendationProposalSchema.nullable(),
  error: z.string().nullable(),
});

export type AIHypothesisProposal = z.infer<typeof AIHypothesisProposalSchema>;
export type AIEvidenceInterpretation = z.infer<typeof AIEvidenceInterpretationSchema>;
export type AIRecommendationProposal = z.infer<typeof AIRecommendationProposalSchema>;
export type AIInvestigationResult = z.infer<typeof AIInvestigationResultSchema>;
