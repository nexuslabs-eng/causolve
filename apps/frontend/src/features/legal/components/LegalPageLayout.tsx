import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface LegalPageLayoutProps {
    title: string;
    lastUpdated: string;
    children: ReactNode;
}

const LegalPageLayout = ({
    title,
    lastUpdated,
    children,
}: LegalPageLayoutProps) => (
    <main className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-205 px-5 py-16 sm:px-8 lg:py-24">
        
            <Link
                to="/"
                className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Back to Home
            </Link>

            <header className="border-b border-border pb-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary-bright">
                Legal
                </p>
                
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
                </h1>
                
                <p className="mt-4 text-sm text-muted-foreground">
                Last updated: {lastUpdated}
                </p>
            </header>

            <article className="mt-10 max-w-none text-sm leading-7 text-muted-foreground [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-foreground [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-2 [&_p]:mb-5 [&_section]:scroll-mt-24 [&_ul]:mb-5 [&_ul]:space-y-2">
                {children}
            </article>
        </div>
    </main>
);

export default LegalPageLayout;
