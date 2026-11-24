import { useState } from "react";
import { CheckCircle, UserPlus } from "lucide-react";

import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InviteMembersForm } from "@/components/dialog/invite-members-form";
import type { InvitationSuccessStateProps, InviteMembersDialogProps } from "@/types/invitations";

const InviteMembersDialog = ({
  open,
  onOpenChange,
  onSend,
  sending = false,
  workspaceName,
}: InviteMembersDialogProps) => {
  const [sent, setSent] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSent(false);
      setSentCount(0);
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogBackdrop />

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <DialogContent className="max-h-[min(90vh,720px)] max-w-2xl overflow-y-auto">
            {sent ? (
              <SuccessState count={sentCount} onClose={() => handleOpenChange(false)} />
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <UserPlus aria-hidden="true" className="size-5" />
                  </div>

                  <div>
                    <DialogTitle>Invite team members</DialogTitle>

                    <DialogDescription>
                      Invite teammates to collaborate in {workspaceName ?? "your"} workspace.
                    </DialogDescription>
                  </div>
                </div>

                <InviteMembersForm
                  key={open ? "open" : "closed"}
                  onSend={onSend}
                  onSent={(count) => {
                    setSentCount(count);
                    setSent(true);
                  }}
                  onCancel={() => handleOpenChange(false)}
                  sending={sending}
                />
              </>
            )}
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
};

const SuccessState = ({ count, onClose }: InvitationSuccessStateProps) => (
  <div className="space-y-6" role="status" aria-live="polite">
    <div className="flex flex-col items-center px-4 py-6 text-center">
      <CheckCircle aria-hidden="true" className="size-10 text-success" />

      <DialogTitle className="mt-4">
        {count === 1 ? "Invitation sent" : "Invitations sent"}
      </DialogTitle>

      <DialogDescription className="mt-2 max-w-sm">
        {count === 1
          ? "An invitation has been sent to your teammate to join this workspace."
          : "The invitations have been sent to your teammates to join this workspace."}
      </DialogDescription>
    </div>

    <div className="flex justify-end border-t border-border pt-5">
      <Button type="button" variant="brand" onClick={onClose}>
        Close
      </Button>
    </div>
  </div>
);

export default InviteMembersDialog;
