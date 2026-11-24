import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InviteMembersDialog from "@/components/dialog/invite-members";
import { MembersInvitations } from "@/features/workspace/components/MembersInvitations";
import { useMembersSettings } from "@/features/workspace/hooks/use-members-settings";

const MembersSettings = () => {
  const {
    invitationsQuery,
    page,
    setPage,
    inviteDialogOpen,
    setInviteDialogOpen,
    workspaceName,
    openInviteDialog,
    sendInvitations,
    resendInvitation,
    revokeInvitation,
    sending,
    changingInvitation,
    activeInvitationAction,
  } = useMembersSettings();

  return (
    <div className="min-w-0">
      <header className="flex min-w-0 items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Members & roles</h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage workspace invitations and the roles assigned to invited members.
          </p>
        </div>

        <Button className="shrink-0" type="button" variant="brand" onClick={openInviteDialog}>
          <UserPlus />
          Invite members
        </Button>
      </header>

      <section className="mt-6 min-w-0">
        <MembersInvitations
          data={invitationsQuery.data}
          loading={invitationsQuery.isPending}
          failed={invitationsQuery.isError}
          page={page}
          onPageChange={setPage}
          onResend={resendInvitation}
          onRevoke={revokeInvitation}
          changingInvitation={changingInvitation}
          activeInvitationAction={activeInvitationAction}
          retrying={invitationsQuery.isFetching}
          onRetry={() => void invitationsQuery.refetch()}
        />
      </section>

      <InviteMembersDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSend={sendInvitations}
        sending={sending}
        workspaceName={workspaceName}
      />
    </div>
  );
};

export { MembersSettings };
