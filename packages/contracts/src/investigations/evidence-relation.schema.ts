import { z } from "zod";
import { ContradictionSeveritySchema } from "../common/enums.js";
import { IdSchema, ScoreSchema } from "../common/primitives.js";

const BaseRelationSchema = z.object({
  id: IdSchema,
  evidenceId: IdSchema,
  hypothesisId: IdSchema,
  reasoning: z.string(),
});

export const EvidenceHypothesisRelationSchema = z.discriminatedUnion("relation", [
  BaseRelationSchema.extend({
    relation: z.literal("SUPPORTS"),
    weight: ScoreSchema,
  }),

  BaseRelationSchema.extend({
    relation: z.literal("CONTRADICTS"),
    contradictionSeverity: ContradictionSeveritySchema,
    weight: ScoreSchema,
  }),

  BaseRelationSchema.extend({
    relation: z.literal("NEUTRAL"),
  }),
]);

export type EvidenceHypothesisRelation = z.infer<typeof EvidenceHypothesisRelationSchema>;
