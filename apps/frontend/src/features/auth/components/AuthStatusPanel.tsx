import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusTone = "success" | "info";
type IconStatus = "loading" | "idle";

interface AuthStatusPanelProps {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  children?: ReactNode;
  tone?: StatusTone;
  className?: string;
  iconStatus?: IconStatus;
}

const toneStyles: Record<StatusTone, string> = {
  success: "border-success/20 bg-success/5 text-success",
  info: "border-primary/20 bg-primary/5 text-primary-bright",
};

export const AuthStatusPanel = ({
  iconStatus,
  icon: Icon,
  title,
  description,
  children,
  tone = "info",
  className,
}: AuthStatusPanelProps) => {
  return (
    <div className={cn("w-full flex flex-col", className)}>
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-md border",
          toneStyles[tone],
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn("h-5 w-5", iconStatus === "loading" ? "animate-spin" : "")}
        />
      </div>

      <h1 className="mt-7 text-3xl font-semibold leading-tight text-foreground">{title}</h1>

      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</div>

      {children ? <div className="mt-8 self-start">{children}</div> : null}
    </div>
  );
};
