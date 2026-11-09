import { z } from "zod";
import { RoleSchema } from "../common/enums.js";
import { EmailSchema } from "../common/primitives.js";
import { InvitationSchema } from "./invitation.schema.js";
import { JobRoleSchema } from "../onboarding/onboarding.enums.js";

export const CreateInvitationRequestSchema = z.object({
  email: EmailSchema,
  role: RoleSchema,
  jobRole: JobRoleSchema,
});

export const CreateInvitationResponseSchema = z.object({
  invitation: InvitationSchema,
});

export type CreateInvitationRequest = z.infer<
  typeof CreateInvitationRequestSchema
>;
export type CreateInvitationResponse = z.infer<
  typeof CreateInvitationResponseSchema
>;
