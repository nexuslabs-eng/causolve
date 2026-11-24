import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

interface AuthAlternateActionProps {
  message: string;
  linkLabel: string;
  to: string;
  className?: string;
}

export const AuthAlternateAction = ({
  message,
  linkLabel,
  to,
  className,
}: AuthAlternateActionProps) => {
  return (
    <p className={cn("mt-7 text-center text-sm text-muted-foreground", className)}>
      {message}{" "}
      <Link
        to={to}
        className="font-medium text-primary-bright transition-colors hover:text-primary"
      >
        {linkLabel}
      </Link>
    </p>
  );
};
