import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const ResendInvitationResponseSchema = z.object({
  invitationId: IdSchema,
  expiresAt: DateTimeSchema,
});

export type ResendInvitationResponse = z.infer<typeof ResendInvitationResponseSchema>;
