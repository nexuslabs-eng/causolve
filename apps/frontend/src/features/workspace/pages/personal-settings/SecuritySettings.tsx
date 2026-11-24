import { useState } from "react";
import { CheckCircle2, ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteAccountDialog } from "@/components/dialog/delete-account-dialog";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useDeleteAccount } from "@/features/auth/hooks/use-delete-account";
import { PasswordForm } from "@/features/workspace/components/PasswordForm";

export const SecuritySettings = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: session } = useAuthSession();
  const deleteAccount = useDeleteAccount();

  const user = session?.authenticated ? session.user : undefined;

  const openDeleteDialog = () => {
    deleteAccount.reset();
    setDeleteDialogOpen(true);
  };

  return (
    <div>
      <header className="border-b border-border pb-6">
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Account & security</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account security and authentication settings.
        </p>
      </header>

      <section className="mt-8 border-b border-border pb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />

          <div>
            <h2 className="font-medium text-foreground">Email verification</h2>

            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />

              <span className="text-emerald-500">
                {user?.emailVerified ? "Verified" : "Not verified"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-8">
        <div>
          <h2 className="font-medium text-foreground">Change password</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Use a strong password that you do not use elsewhere.
          </p>
        </div>

        <PasswordForm />
      </section>

      {import.meta.env.DEV && (
        <section className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <Trash2 className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />

            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-foreground">Delete account</h2>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Permanently delete your account and its associated data.
              </p>

              <Button
                type="button"
                variant="destructive"
                className="mt-4"
                disabled={!user?.email}
                onClick={openDeleteDialog}
              >
                <Trash2 aria-hidden="true" />
                Delete account
              </Button>
            </div>
          </div>
        </section>
      )}

      <DeleteAccountDialog
        open={deleteDialogOpen}
        loading={deleteAccount.isPending}
        error={deleteAccount.error}
        onOpenChange={setDeleteDialogOpen}
        onDismissError={() => deleteAccount.reset()}
        onConfirm={() => {
          if (user?.email) {
            deleteAccount.mutate(user.email);
          }
        }}
      />
    </div>
  );
};
