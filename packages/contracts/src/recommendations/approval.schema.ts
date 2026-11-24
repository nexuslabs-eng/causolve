import { z } from "zod";
import { ApprovalDecisionSchema } from "../common/enums.js";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const ApprovalSchema = z.object({
  id: IdSchema,
  recommendationId: IdSchema,
  approverId: IdSchema,
  decision: ApprovalDecisionSchema,
  reason: z.string().nullable(),
  createdAt: DateTimeSchema,
});

export const SubmitApprovalRequestSchema = z.object({
  decision: ApprovalDecisionSchema,
  reason: z.string().trim().max(1000).optional(),
});

export type Approval = z.infer<typeof ApprovalSchema>;
export type SubmitApprovalRequest = z.infer<typeof SubmitApprovalRequestSchema>;
