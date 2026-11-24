import { z } from "zod";
import { RoleSchema } from "../common/enums.js";
import { IdSchema } from "../common/primitives.js";

export const ApprovalRequirementSchema = z.object({
  role: RoleSchema,
  count: z.number().int().positive(),
});

export const ApprovalPolicySchema = z.object({
  recommendationId: IdSchema,
  requirements: z.array(ApprovalRequirementSchema),
  policyReasons: z.array(z.string()),
  currentApprovedCount: z.number().int().nonnegative(),
  satisfied: z.boolean(),
});

export type ApprovalRequirement = z.infer<typeof ApprovalRequirementSchema>;
export type ApprovalPolicy = z.infer<typeof ApprovalPolicySchema>;
