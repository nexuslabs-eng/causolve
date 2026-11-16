import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteAccountDialog } from "@/components/dialog/delete-account-dialog";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useDeleteAccount } from "@/features/auth/hooks/use-delete-account";

export const WorkspaceSettings = () => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { data: session } = useAuthSession();
    const deleteAccount = useDeleteAccount();

    const userEmail = session?.authenticated ? session.user.email : undefined;

    const openDeleteDialog = () => {
        deleteAccount.reset();
        setDeleteDialogOpen(true);
    };

    return (
        <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:px-10">
            <header>
                <p className="font-mono text-[10px] uppercase text-primary-bright">
                    Administration
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-foreground">
                    Settings
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Manage your workspace and account preferences.
                </p>
            </header>

            {import.meta.env.DEV && (
                <section className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
                    <div className="flex items-start gap-3">
                        <Trash2 className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <h2 className="font-medium text-foreground">
                                Account
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                Permanently delete your account and its associated data.
                            </p>
                            <Button
                                type="button"
                                variant="destructive"
                                className="mt-4"
                                disabled={!userEmail}
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
                    if (userEmail) {
                        deleteAccount.mutate(userEmail);
                    }
                }}
            />
        </div>
    );
};
