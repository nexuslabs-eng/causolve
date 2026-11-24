import { queryOptions } from "@tanstack/react-query";
import { getTeams } from "@/features/workspace/api/teams";

export const teamsQueryKey = (
  organizationId: string,
  page: number,
  limit: number,
) => ["workspace", "teams", organizationId, page, limit] as const;

export const teamsQueryOptions = (
  organizationId: string,
  page = 1,
  limit = 10,
) =>
  queryOptions({
    queryKey: teamsQueryKey(organizationId, page, limit),
    queryFn: () => getTeams(organizationId, page, limit),
    enabled: Boolean(organizationId),
    retry: false,
  });
