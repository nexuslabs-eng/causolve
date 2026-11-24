import { z } from "zod";
import { HypothesisStatusSchema } from "../common/enums.js";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const HypothesisRankingChangeSchema = z.object({
  hypothesisId: IdSchema,
  previousRank: z.number().int().min(1).nullable(),
  newRank: z.number().int().min(1),
  previousStatus: HypothesisStatusSchema,
  newStatus: HypothesisStatusSchema,
  reason: z.string(),
  triggeringEvidenceIds: z.array(IdSchema),
  occurredAt: DateTimeSchema,
});

export type HypothesisRankingChange = z.infer<typeof HypothesisRankingChangeSchema>;
