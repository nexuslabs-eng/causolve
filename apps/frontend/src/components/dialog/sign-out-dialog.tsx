import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "lucide-react";

interface SignOutDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export const SignOutDialog = ({ open, loading, onOpenChange, onConfirm }: SignOutDialogProps) => (
  <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
    <DialogPortal>
      <DialogBackdrop />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogContent>
          <DialogTitle>Sign out of Causolve?</DialogTitle>
          <DialogDescription>
            You will need to sign in again to access this workspace.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="subtle" disabled={loading} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={loading}
              variant="brand"
              onClick={onConfirm}
            >
              {loading ? (
                <>
                  <Loader aria-hidden="true" className="animate-spin" />
                  Signing out
                </>
              ) : "Sign out"}
            </Button>
          </div>
        </DialogContent>
      </div>
    </DialogPortal>
  </Dialog>
);
