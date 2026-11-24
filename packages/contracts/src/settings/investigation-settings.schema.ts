import { z } from "zod";

export const EvidenceCollectionTimeoutSchema = z.discriminatedUnion("unit", [
  z.object({
    value: z.number().int().min(30).max(3600),
    unit: z.literal("SECONDS"),
  }),
  z.object({
    value: z.number().int().min(1).max(60),
    unit: z.literal("MINUTES"),
  }),
]);

export const InvestigationSettingsSchema = z.object({
  autoStartInvestigations: z.boolean(),
  evidenceCollectionTimeout: EvidenceCollectionTimeoutSchema,
  maxEvidenceItems: z.number().int().min(1).max(500),
  requireEvidenceAttribution: z.boolean(),
});

export const UpdateInvestigationSettingsRequestSchema =
  InvestigationSettingsSchema;

export type EvidenceCollectionTimeout = z.infer<
  typeof EvidenceCollectionTimeoutSchema
>;

export type InvestigationSettings = z.infer<typeof InvestigationSettingsSchema>;

export type UpdateInvestigationSettingsRequest = z.infer<
  typeof UpdateInvestigationSettingsRequestSchema
>;
