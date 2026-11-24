import { cn } from "@/lib/utils";

interface AuthStepProgressProps {
  currentStep: number;
  totalSteps: number;
  label: string;
  className?: string;
}

export const AuthStepProgress = ({
  currentStep,
  totalSteps,
  label,
  className,
}: AuthStepProgressProps) => {
  return (
    <div
      aria-label={`Step ${currentStep} of ${totalSteps}: ${label}`}
      className={cn("mb-8", className)}
    >
      <div className="flex items-center justify-between font-mono text-[11px]">
        <span className="text-primary-bright">
          STEP {currentStep} OF {totalSteps}
        </span>

        <span className="text-muted-foreground">{label}</span>
      </div>

      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const completed = index < currentStep;

          return (
            <span
              key={index}
              aria-hidden="true"
              className={cn("h-1 rounded-full", completed ? "bg-primary" : "bg-surface-raised")}
            />
          );
        })}
      </div>
    </div>
  );
};
