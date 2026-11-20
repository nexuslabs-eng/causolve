import { z } from "zod";

export const UserPreferencesSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  timeZone: z.string().trim().min(1),
  dateFormat: z.enum(["DD_MM_YYYY", "MM_DD_YYYY", "YYYY_MM_DD"]),
});

// Theme remains localStorage-backed.
export const ServerUserPreferencesSchema = UserPreferencesSchema.omit({
  theme: true,
});

export const UpdateUserPreferencesRequestSchema = ServerUserPreferencesSchema;

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export type DateFormat = UserPreferences["dateFormat"];

export type ServerUserPreferences = z.infer<typeof ServerUserPreferencesSchema>;

export type UpdateUserPreferencesRequest = z.infer<
  typeof UpdateUserPreferencesRequestSchema
>;

export const DEFAULT_SERVER_USER_PREFERENCES = {
  timeZone: "Africa/Lagos",
  dateFormat: "DD_MM_YYYY",
} satisfies ServerUserPreferences;
