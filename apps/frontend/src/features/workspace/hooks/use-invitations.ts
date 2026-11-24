import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateInvitationRequest } from "contracts/invitations/create-invitation.schema";
import { resendInvitation, revokeInvitation } from "@/features/workspace/api/invitations";
import { invitationsQueryOptions } from "@/features/workspace/queries/invitations-query";
import { sendInvitations } from "@/features/workspace/lib/invitations";

export const useInvitations = (organizationId: string, page = 1, limit = 10) =>
  useQuery(invitationsQueryOptions(organizationId, page, limit));

export const useSendWorkspaceInvitations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      invitations,
    }: {
      organizationId: string;
      invitations: CreateInvitationRequest[];
    }) => sendInvitations(organizationId, invitations),

    onSuccess: (_responses, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace", "invitations", variables.organizationId],
      });
    },
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      invitationId,
    }: {
      organizationId: string;
      invitationId: string;
    }) => resendInvitation(organizationId, invitationId),

    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace", "invitations", variables.organizationId],
      });
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      invitationId,
    }: {
      organizationId: string;
      invitationId: string;
    }) => revokeInvitation(organizationId, invitationId),

    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["workspace", "invitations", variables.organizationId],
      });
    },
  });
};
