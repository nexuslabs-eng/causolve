import { z } from "zod";
import { CapabilityNameSchema, EvidenceSourceTypeSchema } from "../common/enums.js";
import { DateTimeSchema, IdSchema, ScoreSchema } from "../common/primitives.js";

export const EvidenceProvenanceSchema = z.object({
  capability: CapabilityNameSchema,
  reference: z.string().min(1),
  capturedAt: DateTimeSchema,
});

export const EvidenceSchema = z.object({
  id: IdSchema,
  reference: z
    .string()
    .trim()
    .regex(/^EV-\d+$/),
  investigationId: IdSchema,
  source: z.string(),
  sourceType: EvidenceSourceTypeSchema,
  observation: z.string(),
  reliability: ScoreSchema,
  specificity: ScoreSchema,
  directness: ScoreSchema,
  freshness: ScoreSchema,
  temporalRelevance: ScoreSchema,
  independenceGroup: z.string(),
  provenance: EvidenceProvenanceSchema,
  createdAt: DateTimeSchema,
});

export type Evidence = z.infer<typeof EvidenceSchema>;
