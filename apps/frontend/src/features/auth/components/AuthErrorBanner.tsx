import { AlertCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AuthErrorBannerProps {
    children: ReactNode;
    onDismiss: () => void;
}

export const AuthErrorBanner = ({ children, onDismiss }: AuthErrorBannerProps) => {
    return (
        <div
            role="alert"
            aria-live="assertive"
            className="mb-6 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />

            <p className="min-w-0 flex-1 leading-relaxed">{children}</p>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Dismiss error"
                className="size-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onDismiss}
            >
                <X aria-hidden="true" />
            </Button>
        </div>
    )
}