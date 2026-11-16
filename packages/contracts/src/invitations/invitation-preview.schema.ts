import { z } from "zod";
import { RoleSchema } from "../common/enums.js";
import {
  DateTimeSchema,
  NonEmptyStringSchema,
  IdSchema,
} from "../common/primitives.js";
import { WorkspaceSlugSchema } from "../onboarding/workspace-setup.schema.js";
import { InvitationStatusSchema } from "./invitation.enums.js";
import { JobRoleSchema } from "../onboarding/onboarding.enums.js";

export const InvitationTokenSchema = z
  .string()
  .min(32, "Invalid invitation token.");

export const InvitationTokenRequestSchema = z.object({
  token: InvitationTokenSchema,
});

export const InvitationPreviewSchema = z.object({
  invitationId: IdSchema,
  email: z.email(),
  organization: z.object({
    id: IdSchema,
    name: NonEmptyStringSchema,
    slug: WorkspaceSlugSchema,
  }),
  role: RoleSchema,
  jobRole: JobRoleSchema,
  invitedBy: z.object({
    id: IdSchema,
    fullName: NonEmptyStringSchema,
  }),
  expiresAt: DateTimeSchema,
  status: InvitationStatusSchema,
});

export type InvitationToken = z.infer<typeof InvitationTokenSchema>;
export type InvitationTokenRequest = z.infer<
  typeof InvitationTokenRequestSchema
>;
export type InvitationPreview = z.infer<typeof InvitationPreviewSchema>;
