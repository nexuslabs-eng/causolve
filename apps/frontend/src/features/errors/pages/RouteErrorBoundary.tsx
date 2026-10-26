import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

const RouteErrorBoundary = () => {
    const error = useRouteError();
    const status = isRouteErrorResponse(error) ? error.status : 500;
    const { data: session } = useAuthSession();

    return (
        <main className="relative grid min-h-svh place-items-center overflow-hidden bg-background px-5 py-12">
            <div
                aria-hidden="true"
                className="grid-backdrop pointer-events-none absolute inset-0 opacity-40"
            />

            <section className="relative w-full max-w-lg text-center">
                <ResolutionNode className="mx-auto h-12 text-primary-bright" />

                <div className="mx-auto mt-8 flex size-11 items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 text-destructive">
                    <TriangleAlert aria-hidden="true" className="size-5" />
                </div>

                <p className="mt-6 font-mono text-xs uppercase text-destructive">
                    {status} / Application error
                </p>

                <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
                    Causolve encountered an error
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                    The requested operation could not be completed. Reload the
                    application or return home.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                        type="button"
                        variant="subtle"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw aria-hidden="true" />
                        Try again
                    </Button>

                    <Button
                        type="button"
                        variant="brand"
                        onClick={() =>
                            window.location.assign(
                                session?.authenticated ? "/workspace" : "/",
                            )
                        }
                    >
                        <Home aria-hidden="true" />
                        Return to Causolve
                    </Button>
                </div>
            </section>
        </main>
    );
};

export default RouteErrorBoundary;
