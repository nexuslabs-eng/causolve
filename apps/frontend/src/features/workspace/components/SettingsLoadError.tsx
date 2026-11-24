import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type SettingsLoadErrorProps = {
  message: string;
  reason?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export const SettingsLoadError = ({
  message,
  reason = "Try again shortly.",
  onRetry,
  retrying = false,
}: SettingsLoadErrorProps) => {
  return (
    <div
      className="mt-6 flex items-start gap-3 border border-critical/30 bg-critical/5 px-4 py-3"
      role="alert"
    >
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-critical" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{message}</p>

        <p className="mt-0.5 text-xs text-muted-foreground">{reason}</p>
      </div>

      {onRetry && (
        <Button type="button" size="sm" variant="subtle" disabled={retrying} onClick={onRetry}>
          <RefreshCw aria-hidden="true" className={retrying ? "animate-spin" : undefined} />
          {retrying ? "Retrying..." : "Retry"}
        </Button>
      )}
    </div>
  );
};
