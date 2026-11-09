import { z } from "zod";
import { HypothesisStatusSchema } from "../common/enums.js";
import { DateTimeSchema, IdSchema, ScoreSchema } from "../common/primitives.js";
import { paginatedResponseSchema } from "../common/pagination.schema.js";

export const HypothesisSchema = z.object({
  id: IdSchema,
  reference: z
    .string()
    .trim()
    .regex(/^H\d+$/),
  investigationId: IdSchema,
  statement: z.string(),
  status: HypothesisStatusSchema,
  supportStrength: ScoreSchema,
  contradictionPressure: ScoreSchema,
  independentEvidenceGroups: z.number().int().min(0),
  unresolvedContradictions: z.number().int().min(0),
  rank: z.number().int().min(1),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateHypothesisRequestSchema = z.object({
  statement: z.string().trim().min(3).max(2000),
});

export const HypothesisListResponseSchema =
  paginatedResponseSchema(HypothesisSchema);

export type Hypothesis = z.infer<typeof HypothesisSchema>;
export type CreateHypothesisRequest = z.infer<
  typeof CreateHypothesisRequestSchema
>;
export type HypothesisListResponse = z.infer<
  typeof HypothesisListResponseSchema
>;
