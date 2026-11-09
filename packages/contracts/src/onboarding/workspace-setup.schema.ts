import { z } from "zod";
import { NonEmptyStringSchema, IdSchema } from "../common/primitives.js";
import { TeamSizeSchema } from "./onboarding.enums.js";

export const WorkspaceSlugSchema = z
  .string()
  .trim()
  .min(3, "Workspace URL must contain at least 3 characters.")
  .max(63, "Workspace URL cannot exceed 63 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Workspace URL may contain lowercase letters, numbers and hyphens.",
  );

export const WorkspaceSetupRequestSchema = z.object({
  name: NonEmptyStringSchema,
  slug: WorkspaceSlugSchema,
  teamSize: TeamSizeSchema,
});

export const WorkspaceSetupResponseSchema = z.object({
  organizationId: IdSchema,
  workspaceName: NonEmptyStringSchema,
  workspaceSlug: WorkspaceSlugSchema,
  nextStep: z.literal("PROFILE"),
});

export const WorkspaceSlugAvailabilityResponseSchema = z.object({
  slug: WorkspaceSlugSchema,
  available: z.boolean(),
});

export type WorkspaceSlug = z.infer<typeof WorkspaceSlugSchema>;
export type WorkspaceSetupRequest = z.infer<typeof WorkspaceSetupRequestSchema>;
export type WorkspaceSetupResponse = z.infer<
  typeof WorkspaceSetupResponseSchema
>;
export type WorkspaceSlugAvailabilityResponse = z.infer<
  typeof WorkspaceSlugAvailabilityResponseSchema
>;
