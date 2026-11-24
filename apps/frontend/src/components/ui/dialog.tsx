/* eslint-disable react-refresh/only-export-components */
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { forwardRef, type ComponentProps } from "react";

const Dialog = BaseDialog.Root;
const DialogTrigger = BaseDialog.Trigger;
const DialogClose = BaseDialog.Close;
const DialogPortal = BaseDialog.Portal;

const DialogBackdrop = forwardRef<HTMLDivElement, ComponentProps<typeof BaseDialog.Backdrop>>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Backdrop
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/70 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0",
        className,
      )}
      {...props}
    />
  ),
);

const DialogContent = forwardRef<HTMLDivElement, ComponentProps<typeof BaseDialog.Popup>>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Popup
      ref={ref}
      className={cn(
        "w-full max-w-sm rounded-lg border border-border bg-surface-raised p-5 text-foreground shadow-xl outline-none",
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
        className,
      )}
      {...props}
    />
  ),
);

const DialogTitle = forwardRef<HTMLHeadingElement, ComponentProps<typeof BaseDialog.Title>>(
  ({ className, ...props }, ref) => (
    <BaseDialog.Title ref={ref} className={cn("text-base font-semibold", className)} {...props} />
  ),
);

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  ComponentProps<typeof BaseDialog.Description>
>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    ref={ref}
    className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
