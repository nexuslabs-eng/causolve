import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <main className="relative grid min-h-svh place-items-center overflow-hidden bg-background px-5 py-12">
            <div
                aria-hidden="true"
                className="grid-backdrop pointer-events-none absolute inset-0 opacity-40"
            />

            <section className="relative w-full max-w-lg text-center">
                <ResolutionNode className="mx-auto h-12 text-primary-bright" />

                <p className="mt-8 font-mono text-xs uppercase text-primary-bright">
                    404 / Route not found
                </p>

                <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
                    This page could not be found
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                    The requested route does not exist or may have been moved.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button
                        type="button"
                        variant="subtle"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft aria-hidden="true" />
                        Go back
                    </Button>

                    <Button
                        type="button"
                        variant="brand"
                        onClick={() => navigate("/", { replace: true })}
                    >
                        <Home aria-hidden="true" />
                        Causolve home
                    </Button>
                </div>
            </section>
        </main>
    );
};

export default NotFound;