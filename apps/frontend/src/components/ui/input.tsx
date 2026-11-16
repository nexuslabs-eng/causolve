import { forwardRef } from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLElement, InputPrimitive.Props>(
    ({ className, ...props }, ref) => {
        return (
            <InputPrimitive
                ref={ref}
                data-slot="input"
                className={cn(
                    "h-11 w-full rounded-md border border-input bg-surface-inset/40 px-3.5",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "transition-[border-color,box-shadow,background-color]",
                    "focus-visible:border-primary/60 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    "data-invalid:border-destructive data-invalid:ring-2",
                    "data-invalid:ring-destructive/20",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);

Input.displayName = "Input";
