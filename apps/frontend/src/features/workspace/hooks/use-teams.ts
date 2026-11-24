import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTeamRequest, UpdateTeamRequest } from "contracts/teams/team.schema";
import {
  createTeam,
  deleteTeam,
  updateTeam,
} from "@/features/workspace/api/teams";
import { teamsQueryOptions } from "@/features/workspace/queries/teams-query";

export const useTeams = (organizationId: string, page = 1, limit = 10) =>
  useQuery(teamsQueryOptions(organizationId, page, limit));

const invalidateTeams = (queryClient: ReturnType<typeof useQueryClient>, organizationId: string) =>
  queryClient.invalidateQueries({
    queryKey: ["workspace", "teams", organizationId],
  });

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, input }: { organizationId: string; input: CreateTeamRequest }) =>
      createTeam(organizationId, input),
    onSuccess: (_team, variables) => invalidateTeams(queryClient, variables.organizationId),
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, teamId, input }: { organizationId: string; teamId: string; input: UpdateTeamRequest }) =>
      updateTeam(organizationId, teamId, input),
    onSuccess: (_team, variables) => invalidateTeams(queryClient, variables.organizationId),
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, teamId }: { organizationId: string; teamId: string }) =>
      deleteTeam(organizationId, teamId),
    onSuccess: (_result, variables) => invalidateTeams(queryClient, variables.organizationId),
  });
};
