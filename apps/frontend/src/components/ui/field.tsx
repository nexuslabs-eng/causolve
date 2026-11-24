import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "@/lib/utils";

export const Field = ({ className, ...props }: FieldPrimitive.Root.Props) => {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      className={cn("group/field flex flex-col gap-2", className)}
      {...props}
    />
  );
};

export const FieldLabel = ({ className, ...props }: FieldPrimitive.Label.Props) => {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium text-foreground",
        "group-data-disabled/field:cursor-not-allowed",
        "group-data-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

export const FieldDescription = ({ className, ...props }: FieldPrimitive.Description.Props) => {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-xs leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
};

export const FieldError = ({ className, ...props }: FieldPrimitive.Error.Props) => {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("text-xs leading-relaxed text-destructive", className)}
      {...props}
    />
  );
};
