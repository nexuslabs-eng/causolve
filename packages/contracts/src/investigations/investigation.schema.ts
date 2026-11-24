import { z } from "zod";
import { IntegrityLevelSchema, InvestigationStatusSchema } from "../common/enums.js";
import { DateTimeSchema, IdSchema, ScoreSchema } from "../common/primitives.js";

export const InvestigationSchema = z.object({
  id: IdSchema,
  incidentId: IdSchema,
  status: InvestigationStatusSchema,
  integrity: IntegrityLevelSchema,
  evidenceCoverage: ScoreSchema,
  leadingHypothesisId: IdSchema.nullable(),
  startedAt: DateTimeSchema,
  completedAt: DateTimeSchema.nullable(),
});

export type Investigation = z.infer<typeof InvestigationSchema>;
