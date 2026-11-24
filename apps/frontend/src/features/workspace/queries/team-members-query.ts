import { queryOptions } from "@tanstack/react-query";
import { getTeamMembers, getWorkspaceMembers } from "@/features/workspace/api/team-members";

export const workspaceMembersQueryKey = (organizationId: string) =>
  ["workspace", "members", organizationId] as const;

export const teamMembersQueryKey = (organizationId: string, teamId: string) =>
  ["workspace", "teams", teamId, "members", organizationId] as const;

export const workspaceMembersQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: workspaceMembersQueryKey(organizationId),
    queryFn: () => getWorkspaceMembers(organizationId),
    enabled: Boolean(organizationId),
    retry: false,
  });

export const teamMembersQueryOptions = (organizationId: string, teamId: string) =>
  queryOptions({
    queryKey: teamMembersQueryKey(organizationId, teamId),
    queryFn: () => getTeamMembers(organizationId, teamId),
    enabled: Boolean(organizationId && teamId),
    retry: false,
  });
