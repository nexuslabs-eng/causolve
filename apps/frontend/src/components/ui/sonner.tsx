import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useThemeStore } from "@/stores/use-theme-store";

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      closeButton
      richColors={false}
      expand={false}
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-info" />,
        warning: <TriangleAlertIcon className="size-4 text-caution" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface-raised)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--success-border":
            "color-mix(in oklab, var(--success) 30%, transparent)",
          "--error-border":
            "color-mix(in oklab, var(--destructive) 30%, transparent)",
          "--info-border": "color-mix(in oklab, var(--info) 30%, transparent)",
          "--warning-border":
            "color-mix(in oklab, var(--caution) 30%, transparent)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "border bg-surface-raised text-foreground shadow-panel data-[type=success]:!border-success/30 data-[type=error]:!border-destructive/30 data-[type=info]:!border-info/30 data-[type=warning]:!border-caution/30",
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground",
          closeButton:
            "border-border bg-surface-inset text-muted-foreground hover:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
