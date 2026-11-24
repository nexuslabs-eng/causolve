import { z } from "zod";
import { TeamSizeSchema } from "../onboarding/onboarding.enums.js";
import { WorkspaceSlugSchema } from "../onboarding/workspace-setup.schema.js";

export const WorkspaceSettingsSchema = z.object({
  organizationId: z.uuid(),
  name: z.string().trim().min(1),
  slug: WorkspaceSlugSchema,
  teamSize: TeamSizeSchema.nullable(),
});

export const UpdateWorkspaceSettingsRequestSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required."),
  slug: WorkspaceSlugSchema,
  teamSize: TeamSizeSchema,
});

export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;

export type UpdateWorkspaceSettingsRequest = z.infer<typeof UpdateWorkspaceSettingsRequestSchema>;
