/* eslint-disable react-refresh/only-export-components */
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";
import { forwardRef, isValidElement, type ComponentProps } from "react";

const TooltipProvider = ({
  delayDuration,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider> & { delayDuration?: number }) => (
  <TooltipPrimitive.Provider delay={delayDuration} {...props} />
);

const Tooltip = TooltipPrimitive.Root;

type TooltipTriggerProps = ComponentProps<typeof TooltipPrimitive.Trigger> & { asChild?: boolean };

const TooltipTrigger = ({ asChild, children, ...props }: TooltipTriggerProps) => (
  <TooltipPrimitive.Trigger
    {...props}
    render={asChild && isValidElement(children) ? children : undefined}
  >
    {asChild ? undefined : children}
  </TooltipPrimitive.Trigger>
);

const TooltipContent = forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup>, "side"> & {
    side?: React.ComponentProps<typeof TooltipPrimitive.Positioner>["side"];
    sideOffset?: number;
  }
>(({ className, side = "top", sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
