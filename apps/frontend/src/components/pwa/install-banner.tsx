import { motion } from "motion/react";
import { FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface InstallBannerProps {
  requiresIosInstructions: boolean | null;
  onOpen: () => void;
  onDismiss: () => void;
}

export const InstallBanner = ({
  requiresIosInstructions,
  onOpen,
  onDismiss,
}: InstallBannerProps) => (
  <motion.aside
    key="pwa-install-banner"
    initial={{ opacity: 0, x: 32, y: 8 }}
    animate={{ opacity: 1, x: 0, y: 0 }}
    exit={{ opacity: 0, x: 32, y: 8 }}
    transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.8 }}
    aria-labelledby="pwa-install-banner-title"
    className="fixed right-4 bottom-4 z-60 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-popover p-4 text-foreground shadow-2xl"
  >
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-info-soft text-primary">
        <FiDownload size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="pwa-install-banner-title" className="text-sm font-semibold">
          {requiresIosInstructions ? "Add Causolve to your Home Screen" : "Install Causolve"}
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {requiresIosInstructions
            ? "Use Causolve like an app for faster access to your incident workspace."
            : "Keep your incident workspace one click away in a standalone app."}
        </p>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap justify-end gap-2">
      <Button variant="ghost" onClick={onDismiss}>
        Not now
      </Button>

      <Button variant="brand" onClick={onOpen}>
        {requiresIosInstructions ? "Show steps" : "Install Causolve"}
      </Button>
    </div>
  </motion.aside>
);
