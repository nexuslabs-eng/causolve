import { z } from "zod";
import {
  BlastRadiusSchema,
  IntegrityLevelSchema,
  RecommendationActionTypeSchema,
  TechnicalRiskSchema,
} from "../common/enums.js";
import { DateTimeSchema, IdSchema, ScoreSchema } from "../common/primitives.js";

export const RecommendationSchema = z.object({
  id: IdSchema,
  investigationId: IdSchema,
  hypothesisId: IdSchema,
  actionType: RecommendationActionTypeSchema,
  summary: z.string(),
  reasoning: z.string(),
  technicalRisk: TechnicalRiskSchema,
  blastRadius: BlastRadiusSchema,
  supportingEvidenceIds: z.array(IdSchema),
  contradictingEvidenceIds: z.array(IdSchema),
  investigationIntegrity: IntegrityLevelSchema,
  evidenceCoverage: ScoreSchema,
  contradictionPressure: ScoreSchema,
  createdAt: DateTimeSchema,
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
