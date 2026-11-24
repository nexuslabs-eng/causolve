import { useState } from "react";
import type { CreateInvitationRequest } from "contracts/invitations/create-invitation.schema";
import { toast } from "sonner";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { isApiClientError } from "@/lib/api/api-client-error";
import {
  useInvitations,
  useResendInvitation,
  useRevokeInvitation,
  useSendWorkspaceInvitations,
} from "@/features/workspace/hooks/use-invitations";

export const MEMBERS_PAGE_SIZE = 10;

export type InvitationAction = {
  invitationId: string;
  type: "resend" | "revoke";
};

export const useMembersSettings = () => {
  const [page, setPage] = useState(1);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);
  const [activeInvitationAction, setActiveInvitationAction] = useState<InvitationAction | null>(
    null,
  );

  const { data: session } = useAuthSession();

  const organizationId = session?.authenticated
    ? (session.activeWorkspace?.organizationId ?? "")
    : "";

  const workspaceName = session?.authenticated ? session.activeWorkspace?.name : undefined;

  const invitationsQuery = useInvitations(organizationId, page, MEMBERS_PAGE_SIZE);
  const sendInvitationsMutation = useSendWorkspaceInvitations();
  const resendMutation = useResendInvitation();
  const revokeMutation = useRevokeInvitation();

  const requestError =
    invitationsQuery.error instanceof Error ? invitationsQuery.error.message : undefined;

  const sendInvitations = async (invitations: CreateInvitationRequest[]) => {
    if (!organizationId) {
      throw new Error("No active workspace was found.");
    }

    await sendInvitationsMutation.mutateAsync({
      organizationId,
      invitations,
    });
  };

  const resendInvitation = (invitationId: string) => {
    if (!organizationId) return;

    setActiveInvitationAction({ type: "resend", invitationId });

    resendMutation.mutate(
      { organizationId, invitationId },
      {
        onSuccess: () => {
          setActiveInvitationAction(null);
          toast.success("Invitation resent successfully.");
        },
        onError: (error) => {
          setActiveInvitationAction(null);
          toast.error(isApiClientError(error) ? error.message : "Unable to resend the invitation.");
        },
      },
    );
  };

  const revokeInvitation = (invitationId: string) => {
    if (!organizationId) return;

    setActiveInvitationAction({ type: "revoke", invitationId });

    revokeMutation.mutate(
      { organizationId, invitationId },
      {
        onSuccess: () => {
          setActiveInvitationAction(null);
          toast.success("Invitation revoked successfully.");
        },
        onError: (error) => {
          setActiveInvitationAction(null);
          toast.error(isApiClientError(error) ? error.message : "Unable to revoke the invitation.");
        },
      },
    );
  };

  const openInviteDialog = () => {
    setDismissedError(false);
    setInviteDialogOpen(true);
  };

  return {
    invitationsQuery,
    page,
    setPage,
    inviteDialogOpen,
    setInviteDialogOpen,
    workspaceName,
    requestError,
    dismissedError,
    dismissError: () => setDismissedError(true),
    openInviteDialog,
    sendInvitations,
    resendInvitation,
    revokeInvitation,
    activeInvitationAction,
    sending: sendInvitationsMutation.isPending,
    changingInvitation: resendMutation.isPending || revokeMutation.isPending,
  };
};
