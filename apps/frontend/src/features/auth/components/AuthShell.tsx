import type { ReactNode } from "react";
import { 
    Activity,
    BadgeCheck,
    GitBranch,
    ShieldCheck
} from "lucide-react";
import { AuthBrand } from "@/features/auth/components/AuthBrand";
import { cn } from "@/lib/utils";

interface AuthShellProps {
    children: ReactNode;
    contentClassName?: string;
}

const SIGNALS = [
    {
        icon: BadgeCheck,
        label: "Deployment evidence",
        value: "SUPPORTS"
    },
    {
        icon: GitBranch,
        label: "Provider timeline",
        value: "CONTRADICTS",
    },
    {
        icon:ShieldCheck,
        label: "Human authorization",
        value: "REQUIRED",
    }
];

export const AuthShell = ({
    children,
    contentClassName
}: AuthShellProps) => {

    return (
        <div className="min-h-svh bg-background lg:grid lg:grid-cols-[41%_59%]">
            <aside className="relative hidden min-h-svh overflow-hidden border-r border-border lg:flex lg:flex-col">
                <div className="grid-backdrop pointer-events-none absolute inset-0" />

                <header className="relative px-14 py-10">
                    <AuthBrand />
                </header>

                <div className="relative flex flex-1 items-center px-14 py-12">
                    <div className="w-full max-w-md">
                        <p className="font-mono text-[11px] uppercase text-primary-bright">
                        Evidence-aware response
                        </p>

                        <h1 className="mt-6 max-w-sm text-4xl font-semibold leading-tight text-foreground">
                            Investigate incidents with evidence, not assumptions.
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                            Evidence-aware incident investigation and controlled remediation
                            for engineering teams.
                        </p>

                        <div className="mt-10 overflow-hidden rounded-lg border border-border bg-surface/80 shadow-(--shadow-panel)">
                            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                                <Activity
                                    aria-hidden="true"
                                    className="h-4 w-4 text-critical"
                                />
                                
                                <span className="text-sm font-medium text-foreground">
                                    Investigation state
                                </span>
                                    
                                <span className="ml-auto font-mono text-[10px] text-caution">
                                    DEGRADED
                                </span>
                            </div>

                            <ul className="divide-y divide-border">
                                {SIGNALS.map((signal) => (
                                    <li
                                    key={signal.label}
                                    className="flex items-center gap-3 px-5 py-4"
                                    >
                                        <signal.icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                                        
                                        <span className="text-sm text-foreground">{signal.label}</span>
                                        
                                        <span
                                            className="ml-auto font-mono text-[10px] text-muted-foreground"
                                        >
                                            {signal.value}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <footer className="relative border-t border-border px-14 py-6">
                    <p className="font-mono text-[10px] tracking-wide text-muted-foreground">
                    AI recommends. Humans authorize. Causolve enforces.
                    </p>
                </footer>
            </aside>

            <section className="flex min-h-svh flex-col">
                <header className="px-5 py-6 sm:px-8 lg:hidden">
                    <AuthBrand />
                </header>

                <main className="flex flex-1 items-start justify-center px-5 pb-12 pt-8 sm:items-center sm:px-8 sm:py-16 lg:px-14">
                    <div className={cn("w-full max-w-107.5", contentClassName)}>
                    {children}
                    </div>
                </main>

                <footer className="px-5 pb-7 text-center sm:px-8 lg:hidden">
                    <p className="font-mono text-[10px] tracking-wide text-muted-foreground">
                    Evidence-aware incident response
                    </p>
                </footer>
            </section>
        </div>
    )
}