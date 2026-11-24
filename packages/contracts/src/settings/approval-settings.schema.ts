import { z } from "zod";

export const ApprovalSettingsSchema = z.object({
  requireApprovalBeforeRemediation: z.boolean(),
  minimumRequiredApprovals: z.number().int().min(1).max(5),
  automaticRemediationEnabled: z.boolean(),
  approvalTimeoutHours: z.number().int().min(1).max(720),
});

export const UpdateApprovalSettingsRequestSchema = ApprovalSettingsSchema;

export type ApprovalSettings = z.infer<typeof ApprovalSettingsSchema>;

export type UpdateApprovalSettingsRequest = z.infer<typeof UpdateApprovalSettingsRequestSchema>;
