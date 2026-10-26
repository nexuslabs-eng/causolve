import { useRegisterSW } from "virtual:pwa-register/react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";

export const PWAUpdatePrompt = () => {
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
        await updateServiceWorker(true);
    };

    return (
        <AnimatePresence>
        {needRefresh && (
        <motion.div
            key="pwa-update-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-update-title"
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 30,
                    mass: 0.8,
                }}
                className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                        <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                        >
                            <path
                                d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <path
                                d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="min-w-0">
                        <h2
                            id="pwa-update-title"
                            className="text-lg font-semibold text-foreground"
                        >
                            Causolve update available
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            A newer version of Causolve is available. Update when you are ready to use the latest improvements.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={closeDialog}
                    >
                        Later
                    </Button>

                    <Button
                        type="button"
                        variant="brand"
                        onClick={handleRealUpdate}
                    >
                        Update now
                    </Button>
                </div>
            </motion.div>
        </motion.div>
        )}
        </AnimatePresence>
    );
}
