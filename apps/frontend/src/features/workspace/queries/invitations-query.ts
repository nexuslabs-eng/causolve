import { queryOptions } from "@tanstack/react-query";
import { getInvitations } from "@/features/workspace/api/invitations";

export const invitationsQueryKey = (
  organizationId: string,
  page: number,
  limit: number,
) => ["workspace", "invitations", organizationId, page, limit] as const;

export const invitationsQueryOptions = (
  organizationId: string,
  page = 1,
  limit = 10,
) =>
  queryOptions({
    queryKey: invitationsQueryKey(organizationId, page, limit),
    queryFn: () => getInvitations(organizationId, page, limit),
    enabled: Boolean(organizationId),
    retry: false,
  });
