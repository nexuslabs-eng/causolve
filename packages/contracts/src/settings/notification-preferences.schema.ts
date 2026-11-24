import { z } from "zod";

export const NotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  incidentAlerts: z.boolean(),
  investigationUpdates: z.boolean(),
  workspaceInvitations: z.boolean(),
});

export const UpdateNotificationPreferencesRequestSchema =
  NotificationPreferencesSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one notification preference is required.",
  });

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export type UpdateNotificationPreferencesRequest = z.infer<
  typeof UpdateNotificationPreferencesRequestSchema
>;
