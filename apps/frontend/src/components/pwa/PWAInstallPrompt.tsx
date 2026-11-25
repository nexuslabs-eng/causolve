import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { InstallBanner } from "@/components/pwa/install-banner";
import { PWAInstall } from "@/components/dialog/pwa-dialog";
import { detectAppleDevice, isStandaloneMode } from "@/components/pwa/pwaDetection";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIosPromptDismissed, setIsIosPromptDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [appleDevice] = useState(detectAppleDevice);
  const [isStandalone, setIsStandalone] = useState(isStandaloneMode);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsDialogOpen(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const requiresIosInstructions = Boolean(
    appleDevice && appleDevice !== "mac" && !isStandalone && !installEvent,
  );
  const shouldShowBanner =
    Boolean(installEvent) || (requiresIosInstructions && !isIosPromptDismissed);

  const dismiss = () => {
    setIsDialogOpen(false);
    if (requiresIosInstructions) setIsIosPromptDismissed(true);
    else setInstallEvent(null);
  };

  const install = async () => {
    if (!installEvent || installing) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
      setIsDialogOpen(false);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {shouldShowBanner && !isDialogOpen && (
          <InstallBanner
            requiresIosInstructions={requiresIosInstructions}
            onOpen={() => setIsDialogOpen(true)}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>

      <PWAInstall
        open={isDialogOpen}
        requiresIosInstructions={requiresIosInstructions}
        installing={installing}
        onClose={dismiss}
        onInstall={install}
      />
    </>
  );
};
