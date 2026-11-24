import { z } from "zod";
import { IntegrityLevelSchema } from "../common/enums.js";
import { ScoreSchema } from "../common/primitives.js";

export const InvestigationIntegritySchema = z.object({
  level: IntegrityLevelSchema,
  evidenceCoverage: ScoreSchema,

  availableCapabilities: z.number().int().nonnegative(),
  degradedCapabilities: z.number().int().nonnegative(),
  unavailableCapabilities: z.number().int().nonnegative(),

  independentEvidenceGroups: z.number().int().nonnegative(),
  unresolvedContradictions: z.number().int().nonnegative(),

  reasons: z.array(z.string()),
});

export type InvestigationIntegrity = z.infer<typeof InvestigationIntegritySchema>;
