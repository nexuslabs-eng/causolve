import { z } from "zod";
import {
  RecommendationActionTypeSchema,
  RemediationExecutionModeSchema,
  RemediationStatusSchema,
} from "../common/enums.js";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const RemediationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const RemediationSchema = z.object({
  id: IdSchema,
  incidentId: IdSchema,
  recommendationId: IdSchema,
  status: RemediationStatusSchema,
  actionType: RecommendationActionTypeSchema,
  executionMode: RemediationExecutionModeSchema,
  startedAt: DateTimeSchema.nullable(),
  completedAt: DateTimeSchema.nullable(),
  result: RemediationResultSchema.nullable(),
});

export type Remediation = z.infer<typeof RemediationSchema>;
