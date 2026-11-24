import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthFormHeaderProps {
  title: string;
  description: ReactNode;
  eyebrow?: string;
  className?: string;
}

export const AuthFormHeader = ({ title, description, eyebrow, className }: AuthFormHeaderProps) => {
  return (
    <header className={cn("mb-10", className)}>
      {eyebrow ? (
        <p className="mb-4 font-mono text-[11px] uppercase text-primary-bright">{eyebrow}</p>
      ) : null}

      <h1 className="text-3xl font-semibold leading-tight text-foreground">{title}</h1>

      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</div>
    </header>
  );
};
