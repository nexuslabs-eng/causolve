import {
  AddTeamMemberRequestSchema,
  AddTeamMemberResponseSchema,
  RemoveTeamMemberResponseSchema,
  WorkspaceMemberListResponseSchema,
  type AddTeamMemberRequest,
  type AddTeamMemberResponse,
  type RemoveTeamMemberResponse,
  type WorkspaceMemberListResponse,
} from "contracts/teams/team-members.schema";
import { axiosClient } from "@/lib/api/axios-client";

const organizationMembersEndpoint = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/members`;

const teamMembersEndpoint = (organizationId: string, teamId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/teams/${encodeURIComponent(teamId)}/members`;

export const getWorkspaceMembers = async (
  organizationId: string,
  page = 1,
  limit = 100,
): Promise<WorkspaceMemberListResponse> => {
  const response = await axiosClient.get<unknown, unknown>(
    `${organizationMembersEndpoint(organizationId)}?page=${page}&limit=${limit}`,
  );

  return WorkspaceMemberListResponseSchema.parse(response);
};

export const getTeamMembers = async (
  organizationId: string,
  teamId: string,
): Promise<WorkspaceMemberListResponse> => {
  const response = await axiosClient.get<unknown, unknown>(
    teamMembersEndpoint(organizationId, teamId),
  );

  return WorkspaceMemberListResponseSchema.parse(response);
};

export const addTeamMember = async (
  organizationId: string,
  teamId: string,
  input: AddTeamMemberRequest,
): Promise<AddTeamMemberResponse> => {
  const response = await axiosClient.post<unknown, unknown>(
    teamMembersEndpoint(organizationId, teamId),
    AddTeamMemberRequestSchema.parse(input),
  );

  return AddTeamMemberResponseSchema.parse(response);
};

export const removeTeamMember = async (
  organizationId: string,
  teamId: string,
  membershipId: string,
): Promise<RemoveTeamMemberResponse> => {
  const response = await axiosClient.delete<unknown, unknown>(
    `${teamMembersEndpoint(organizationId, teamId)}/${encodeURIComponent(
      membershipId,
    )}`,
  );

  return RemoveTeamMemberResponseSchema.parse(response);
};
