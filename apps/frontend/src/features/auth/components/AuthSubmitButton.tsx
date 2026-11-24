import type { ComponentProps, ReactNode } from "react";
import { ArrowRight, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export const AuthSubmitButton = ({
  loading = false,
  loadingLabel = "Please wait",
  children,
  className,
  disabled,
  ...props
}: AuthSubmitButtonProps) => {
  return (
    <Button
      type="submit"
      variant="brand"
      size="lg"
      disabled={disabled || loading}
      className={cn("mt-6 w-full", className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader aria-hidden="true" className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight aria-hidden="true" />
        </>
      )}
    </Button>
  );
};
