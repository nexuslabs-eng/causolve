import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogBackdrop,
    DialogContent,
    DialogDescription,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { isApiClientError } from "@/lib/api/api-client-error";

interface DeleteAccountDialogProps {
    open: boolean;
    loading: boolean;
    error: unknown;
    onOpenChange: (open: boolean) => void;
    onDismissError: () => void;
    onConfirm: () => void;
}

export const DeleteAccountDialog = ({
    open,
    loading,
    error,
    onOpenChange,
    onDismissError,
    onConfirm,
}: DeleteAccountDialogProps) => {
    const errorMessage: string = isApiClientError(error)
        ? String(error.message)
        : error instanceof Error
          ? String(error.message)
          : "Unable to delete the account.";

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!loading) {
                    onOpenChange(nextOpen);
                }
            }}
        >
            <DialogPortal>
                <DialogBackdrop />

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <DialogContent>
                        <DialogTitle>Delete account?</DialogTitle>

                        <DialogDescription>
                            This permanently deletes the authenticated account
                            and its associated data. You will be redirected to
                            the marketing page.
                        </DialogDescription>

                        {Boolean(error) && (
                            <div className="mt-4">
                                <AuthErrorBanner onDismiss={onDismissError}>
                                    {errorMessage}
                                </AuthErrorBanner>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="subtle"
                                disabled={loading}
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                disabled={loading}
                                onClick={onConfirm}
                            >
                                {loading ? (
                                    <>
                                        <Loader
                                            aria-hidden="true"
                                            className="animate-spin"
                                        />
                                        Deleting account
                                    </>
                                ) : (
                                    "Delete account"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </div>
            </DialogPortal>
        </Dialog>
    );
};
