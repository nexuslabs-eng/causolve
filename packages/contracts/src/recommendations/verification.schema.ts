import { z } from "zod";
import { VerificationCheckStatusSchema, VerificationStatusSchema } from "../common/enums.js";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const VerificationCheckSchema = z.object({
  name: z.string(),
  status: VerificationCheckStatusSchema,
  before: z.string(),
  after: z.string(),
});

export const VerificationSchema = z.object({
  id: IdSchema,
  incidentId: IdSchema,
  remediationId: IdSchema,
  status: VerificationStatusSchema,
  checks: z.array(VerificationCheckSchema),
  completedAt: DateTimeSchema.nullable(),
});

export type Verification = z.infer<typeof VerificationSchema>;
