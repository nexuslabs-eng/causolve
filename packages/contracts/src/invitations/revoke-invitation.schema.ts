import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const RevokeInvitationResponseSchema = z.object({
  invitationId: IdSchema,
  status: z.literal("REVOKED"),
  revokedAt: DateTimeSchema,
});

export type RevokeInvitationResponse = z.infer<typeof RevokeInvitationResponseSchema>;
