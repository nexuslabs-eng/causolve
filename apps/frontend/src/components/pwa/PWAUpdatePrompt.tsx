import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const PWAUpdatePrompt = () => {
  const [updating, setUpdating] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (import.meta.env.DEV) {
        console.log("Service worker registered:", swUrl, registration);
      }
    },

    onRegisterError(error) {
      console.error("Service worker registration failed:", error);
    },
  });

  const closeDialog = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  const handleRealUpdate = async () => {
    if (updating) return;
    setUpdating(true);

    try {
      await updateServiceWorker(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog
      open={needRefresh}
      onOpenChange={(open) => {
        if (!open && !updating) closeDialog();
      }}
    >
      <DialogPortal>
        <DialogBackdrop />
        <DialogContent className="max-w-md p-0">
          <div className="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">
              <RefreshCw aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <DialogTitle className="text-lg">Causolve update available</DialogTitle>
              <DialogDescription>
                A newer version of Causolve is ready. Update now to use the latest improvements.
              </DialogDescription>
            </div>
          </div>

          <footer className="flex justify-end gap-2 border-t border-border bg-surface px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={updating}>
              Later
            </Button>

            <Button type="button" variant="brand" onClick={handleRealUpdate} disabled={updating}>
              <RefreshCw aria-hidden="true" className={cn(updating ? "animate-spin" : "")} />
              {updating ? "Updating..." : "Update now"}
            </Button>
          </footer>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
