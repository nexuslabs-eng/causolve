import { useRef, type PointerEvent } from "react";
import { RotateCw } from "lucide-react";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { Button } from "@/components/ui/button";
import styles from "@/components/loading/AppLoading.module.css";

interface AppLoadingProps {
    failed?: boolean;
    onRetry?: () => void;
}

export const AppLoading = ({
    failed = false,
    onRetry,
    }: AppLoadingProps) => {

    const graphicRef = useRef<HTMLDivElement>(null);

    const moveGraphic = (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType !== "mouse") return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        graphicRef.current?.style.setProperty("--offset-x", `${x * 14}px`);
        graphicRef.current?.style.setProperty("--offset-y", `${y * 10}px`);
    };

    const resetGraphic = () => {
        graphicRef.current?.style.setProperty("--offset-x", "0px");
        graphicRef.current?.style.setProperty("--offset-y", "0px");
    };

    return (
        <main
            className="relative grid min-h-svh place-items-center overflow-hidden bg-background px-6 py-12"
            onPointerMove={moveGraphic}
            onPointerLeave={resetGraphic}
            aria-busy={!failed}
        >
            <div
                aria-hidden="true"
                className="grid-backdrop pointer-events-none absolute inset-0 opacity-40"
            />

            <section className="relative w-full max-w-sm text-center">
                <div
                    ref={graphicRef}
                    aria-hidden="true"
                    className={styles.graphic}
                >
                    <div className={styles.axis} />

                    <div className={styles.brand}>
                        <ResolutionNode
                            active={!failed}
                            className="h-24 text-primary-bright sm:h-28"
                        />
                    </div>

                    {!failed && <div className={styles.scan} />}

                    <span className={styles.cornerStart} />
                    <span className={styles.cornerEnd} />
                </div>

                <h1 className="mt-8 text-3xl font-semibold text-foreground">
                Causolve
                </h1>

                <p className="mt-3 text-sm text-muted-foreground">
                Evidence-aware incident response
                </p>

                <div role={failed ? "alert" : "status"} className="mt-9">
                    <p className="text-sm text-foreground">
                        {failed
                        ? "Causolve could not start."
                        : "Preparing Causolve"}
                    </p>

                    {!failed && (
                        <div aria-hidden="true" className={styles.signals}>
                            {[0, 1, 2].map((index) => (
                                <span
                                key={index}
                                className={styles.signal}
                                style={{ animationDelay: `${index * 180}ms` }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {failed && onRetry && (
                    <Button
                        type="button"
                        variant="subtle"
                        className="mt-6"
                        onClick={onRetry}
                    >
                        <RotateCw aria-hidden="true" />
                        Try again
                    </Button>
                )}
            </section>
        </main>
    );
};