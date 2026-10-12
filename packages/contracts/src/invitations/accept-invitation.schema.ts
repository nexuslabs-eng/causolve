import { z } from "zod";
import { RoleSchema } from "../common/enums.js";
import { IdSchema, NonEmptyStringSchema } from "../common/primitives.js";
import { PasswordSchema } from "../auth/password.schema.js";
import { InvitationTokenSchema } from "./invitation-preview.schema.js";

export const AcceptInvitationRequestSchema = z.object({
  token: InvitationTokenSchema,
  fullName: NonEmptyStringSchema,
  password: PasswordSchema,
});

export const AcceptInvitationResponseSchema = z.object({
  accepted: z.literal(true),
  organizationId: IdSchema,
  membership: z.object({
    role: RoleSchema,
  }),
});

export type AcceptInvitationRequest = z.infer<
  typeof AcceptInvitationRequestSchema
>;
export type AcceptInvitationResponse = z.infer<
  typeof AcceptInvitationResponseSchema
>;
