import { Link } from "react-router-dom";
import { ResolutionNode } from "@/components/brand/ResolutionNode";
import { cn } from "@/lib/utils";
import { useExitToMarketing } from "@/features/auth/hooks/use-exit-to-marketing";

interface AuthBrandProps {
    className?: string;
}

export const AuthBrand = ({ className }: AuthBrandProps) => {
    const { exitToMarketing, isExiting } = useExitToMarketing();

    return (
        <Link
            to="/"
            onClick={(e) => {
                e.preventDefault();
                exitToMarketing();
            }}
            aria-label="Causolve home"
            aria-disabled={isExiting}
            className={cn(
                "inline-flex items-center gap-3 text-primary-bright",
                className
            )}
        >
            <ResolutionNode className="h-6" />
            <span className="text-lg font-semibold text-foreground">Causolve</span>
        </Link>
    )
}