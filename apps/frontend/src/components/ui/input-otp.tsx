import { OTPInput, OTPInputContext, type SlotProps } from "input-otp";
import { type ComponentProps, useContext } from "react";

import { cn } from "@/lib/utils";

export const InputOTP = ({
  className,
  containerClassName,
  ...props
}: ComponentProps<typeof OTPInput>) => {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center justify-center disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
};

export const InputOTPGroup = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
};

interface InputOTPSlotProps extends ComponentProps<"div"> {
  index: number;
}

export const InputOTPSlot = ({ index, className, ...props }: InputOTPSlotProps) => {
  const slot: SlotProps = useContext(OTPInputContext).slots[index];

  return (
    <div
      data-slot="input-otp-slot"
      data-active={slot.isActive}
      className={cn(
        "relative flex h-12 w-11 items-center justify-center rounded-md",
        "border border-input bg-surface-inset text-lg font-medium text-foreground",
        "transition-[border-color,box-shadow,background-color]",
        "data-[active=true]:border-primary data-[active=true]:bg-surface-raised",
        "data-[active=true]:ring-2 data-[active=true]:ring-primary/20",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "sm:w-12",
        className,
      )}
      {...props}
    >
      {slot.char}

      {slot.hasFakeCaret && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-px animate-pulse bg-foreground" />
        </span>
      )}
    </div>
  );
};
