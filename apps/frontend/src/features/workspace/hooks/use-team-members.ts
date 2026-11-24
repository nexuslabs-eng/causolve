import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddTeamMemberRequest } from "contracts/teams/team-members.schema";
import { addTeamMember, removeTeamMember } from "@/features/workspace/api/team-members";
import {
  teamMembersQueryKey,
  teamMembersQueryOptions,
  workspaceMembersQueryKey,
  workspaceMembersQueryOptions,
} from "@/features/workspace/queries/team-members-query";

export const useWorkspaceMembers = (organizationId: string) =>
  useQuery(workspaceMembersQueryOptions(organizationId));

export const useTeamMembers = (organizationId: string, teamId: string) =>
  useQuery(teamMembersQueryOptions(organizationId, teamId));

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      teamId,
      input,
    }: {
      organizationId: string;
      teamId: string;
      input: AddTeamMemberRequest;
    }) => addTeamMember(organizationId, teamId, input),

    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: teamMembersQueryKey(variables.organizationId, variables.teamId),
      });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      teamId,
      membershipId,
    }: {
      organizationId: string;
      teamId: string;
      membershipId: string;
    }) => removeTeamMember(organizationId, teamId, membershipId),

    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: teamMembersQueryKey(variables.organizationId, variables.teamId),
      });

      void queryClient.invalidateQueries({
        queryKey: workspaceMembersQueryKey(variables.organizationId),
      });
    },
  });
};
