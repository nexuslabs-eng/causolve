import { useMutation } from "@tanstack/react-query";

import { sendInvitations } from "@/features/workspace/lib/invitations";
import type { SendInvitationsVariables } from "@/types/invitations";

export const useSendInvitations = () =>
    useMutation({
        mutationFn: ({
            organizationId,
            invitations,
        }: SendInvitationsVariables) =>
            sendInvitations(organizationId, invitations),
    });
