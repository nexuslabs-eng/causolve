import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InstallDetails } from "@/components/pwa/install-details";
import { Download, Loader } from "lucide-react";

interface PWAInstallProps {
  open: boolean;
  requiresIosInstructions: boolean;
  installing: boolean;
  onClose: () => void;
  onInstall: () => void;
}

export const PWAInstall = ({
  open,
  requiresIosInstructions,
  installing,
  onClose,
  onInstall,
}: PWAInstallProps) => (
  <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
    <DialogPortal>
      <DialogBackdrop />
      <DialogContent className="relative z-51 max-w-md overflow-hidden p-0">
        <header className="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">
            <Download aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <DialogTitle className="text-lg">
              {requiresIosInstructions
                ? "Install Causolve on your iPhone or iPad"
                : "Install Causolve"}
            </DialogTitle>
            <DialogDescription>
              {requiresIosInstructions
                ? "Follow these steps to add Causolve to your Home Screen."
                : "Keep your incident workspace one click away with the Causolve app."}
            </DialogDescription>
          </div>
        </header>

        <InstallDetails requiresIosInstructions={requiresIosInstructions} />

        <footer className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={onClose} disabled={installing}>
            {requiresIosInstructions ? "Close" : "Not now"}
          </Button>
          {requiresIosInstructions ? (
            <Button variant="brand" onClick={onClose}>
              Got it
            </Button>
          ) : (
            <Button variant="brand" onClick={onInstall} disabled={installing}>
              {installing ? (
                <>
                  <Loader aria-hidden="true" className="animate-spin" />
                  Opening installer...
                </>
              ) : (
                <>
                  <Download aria-hidden="true" />
                  Install Causolve
                </>
              )}
            </Button>
          )}
        </footer>
      </DialogContent>
    </DialogPortal>
  </Dialog>
);
