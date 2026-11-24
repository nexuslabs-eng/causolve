import { queryOptions } from "@tanstack/react-query";
import type { InvitationToken } from "contracts/invitations/invitation-preview.schema";

import { getInvitationPreview } from "@/features/auth/api/invitations";

export const invitationPreviewQueryKey = (token: InvitationToken) =>
    ["auth", "invitation-preview", token] as const;

export const invitationPreviewQueryOptions = (
    token: InvitationToken,
) =>
    queryOptions({
        queryKey: invitationPreviewQueryKey(token),
        queryFn: () => getInvitationPreview(token),
        retry: false,
        staleTime: 0,
    });
