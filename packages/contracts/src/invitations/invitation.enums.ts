import { z } from "zod";

export const InvitationStatusSchema = z.enum(["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"]);

export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;
