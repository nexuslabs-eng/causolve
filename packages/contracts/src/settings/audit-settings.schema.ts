import { z } from "zod";

export const AuditExportPermissionSchema = z.enum([
  "ADMINS_ONLY",
  "ADMINS_AND_AUDITORS",
  "ALL_MEMBERS",
]);

export const AuditEventCategorySchema = z.enum([
  "MEMBERSHIP",
  "SETTINGS",
  "INTEGRATIONS",
  "INCIDENTS",
  "INVESTIGATIONS",
  "REMEDIATION",
]);

export const AuditSettingsSchema = z.object({
  retentionPeriodDays: z.number().int().min(30).max(3650),
  exportPermission: AuditExportPermissionSchema,
  eventCategories: z.array(AuditEventCategorySchema).min(1),
  complianceArchivalEnabled: z.boolean(),
});

export const UpdateAuditSettingsRequestSchema = AuditSettingsSchema;

export type AuditExportPermission = z.infer<
  typeof AuditExportPermissionSchema
>;

export type AuditEventCategory = z.infer<
  typeof AuditEventCategorySchema
>;

export type AuditSettings = z.infer<typeof AuditSettingsSchema>;

export type UpdateAuditSettingsRequest = z.infer<
  typeof UpdateAuditSettingsRequestSchema
>;
