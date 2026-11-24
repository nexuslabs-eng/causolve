import { z } from "zod";
import { JobRoleSchema } from "../onboarding/onboarding.enums.js";
import { RoleSchema } from "../common/enums.js";
import {
  DateTimeSchema,
  IdSchema,
  NonEmptyStringSchema,
} from "../common/primitives.js";
import { paginatedResponseSchema } from "../common/pagination.schema.js";

export const WorkspaceMemberSchema = z.object({
  membershipId: IdSchema,
  userId: IdSchema,
  fullName: NonEmptyStringSchema,
  email: z.email(),
  role: RoleSchema,
  jobRole: JobRoleSchema.nullable(),
  joinedAt: DateTimeSchema,
});

export const WorkspaceMemberListResponseSchema = paginatedResponseSchema(
  WorkspaceMemberSchema,
);

export const AddTeamMemberRequestSchema = z.object({
  membershipId: IdSchema,
});

export const AddTeamMemberResponseSchema = z.object({
  added: z.literal(true),
  member: WorkspaceMemberSchema,
});

export const RemoveTeamMemberResponseSchema = z.object({
  removed: z.literal(true),
});

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;
export type WorkspaceMemberListResponse = z.infer<
  typeof WorkspaceMemberListResponseSchema
>;
export type AddTeamMemberRequest = z.infer<typeof AddTeamMemberRequestSchema>;
export type AddTeamMemberResponse = z.infer<typeof AddTeamMemberResponseSchema>;
export type RemoveTeamMemberResponse = z.infer<
  typeof RemoveTeamMemberResponseSchema
>;
