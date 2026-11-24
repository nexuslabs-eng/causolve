import { z } from "zod";

export const AiEvidenceSettingsSchema = z.object({
  aiAssistanceEnabled: z.boolean(),
  humanApprovalRequired: z.boolean(),
  externalEvidenceAllowed: z.boolean(),
  evidenceRetentionDays: z.number().int().min(30).max(3650),
});

export const UpdateAiEvidenceSettingsRequestSchema = AiEvidenceSettingsSchema;

export type AiEvidenceSettings = z.infer<typeof AiEvidenceSettingsSchema>;
export type UpdateAiEvidenceSettingsRequest = z.infer<typeof UpdateAiEvidenceSettingsRequestSchema>;
