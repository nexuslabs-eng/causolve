import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionUnavailableProps {
    onRetry: () => void;
    retrying?: boolean;
}

export const SessionUnavailable = ({
    onRetry,
    retrying = false,
}: SessionUnavailableProps) => {
    return (
        <main className="grid min-h-svh place-items-center bg-background px-6 py-12">
            <section className="w-full max-w-md text-center">
                <h1 className="text-3xl font-semibold text-foreground">
                    Unable to connect to Causolve
                </h1>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    We're having trouble connecting to our services. Please try again
                    shortly.
                </p>

                <Button
                type="button"
                variant="subtle"
                className="mt-6"
                disabled={retrying}
                onClick={onRetry}
                >
                    <RefreshCw
                        aria-hidden="true"
                        className={retrying ? "animate-spin" : undefined}
                    />
                    {retrying ? "Retrying..." : "Try again"}
                </Button>
            </section>
        </main>
    );
};