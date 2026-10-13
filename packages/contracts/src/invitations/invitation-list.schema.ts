import { z } from "zod";
import { RoleSchema } from "../common/enums.js";
import {
  DateTimeSchema,
  NonEmptyStringSchema,
  IdSchema,
} from "../common/primitives.js";
import { InvitationStatusSchema } from "./invitation.enums.js";

export const InvitationListItemSchema = z.object({
  id: IdSchema,
  email: z.email(),
  role: RoleSchema,
  status: InvitationStatusSchema,
  invitedBy: z.object({
    id: IdSchema,
    fullName: NonEmptyStringSchema,
  }),
  createdAt: DateTimeSchema,
  expiresAt: DateTimeSchema,
});

export const InvitationListResponseSchema = z.object({
  invitations: z.array(InvitationListItemSchema),
  page: z.number(),
  limit: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export type InvitationListItem = z.infer<typeof InvitationListItemSchema>;
export type InvitationListResponse = z.infer<
  typeof InvitationListResponseSchema
>;
