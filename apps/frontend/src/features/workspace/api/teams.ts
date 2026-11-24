import {
  CreateTeamRequestSchema,
  DeleteTeamResponseSchema,
  TeamListResponseSchema,
  TeamSchema,
  UpdateTeamRequestSchema,
  type CreateTeamRequest,
  type DeleteTeamResponse,
  type Team,
  type TeamListResponse,
  type UpdateTeamRequest,
} from "contracts/teams/team.schema";
import { axiosClient } from "@/lib/api/axios-client";

const teamsEndpoint = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/teams`;

export const getTeams = async (
  organizationId: string,
  page = 1,
  limit = 10,
): Promise<TeamListResponse> => {
  const response = await axiosClient.get<unknown, unknown>(
    `${teamsEndpoint(organizationId)}?page=${page}&limit=${limit}`,
  );

  return TeamListResponseSchema.parse(response);
};

export const createTeam = async (
  organizationId: string,
  input: CreateTeamRequest,
): Promise<Team> => {
  const response = await axiosClient.post<unknown, unknown>(
    teamsEndpoint(organizationId),
    CreateTeamRequestSchema.parse(input),
  );

  return TeamSchema.parse(response);
};

export const updateTeam = async (
  organizationId: string,
  teamId: string,
  input: UpdateTeamRequest,
): Promise<Team> => {
  const response = await axiosClient.patch<unknown, unknown>(
    `${teamsEndpoint(organizationId)}/${encodeURIComponent(teamId)}`,
    UpdateTeamRequestSchema.parse(input),
  );

  return TeamSchema.parse(response);
};

export const deleteTeam = async (
  organizationId: string,
  teamId: string,
): Promise<DeleteTeamResponse> => {
  const response = await axiosClient.delete<unknown, unknown>(
    `${teamsEndpoint(organizationId)}/${encodeURIComponent(teamId)}`,
  );

  return DeleteTeamResponseSchema.parse(response);
};
