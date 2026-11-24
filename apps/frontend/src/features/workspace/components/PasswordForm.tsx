import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChangePasswordFormSchema,
  type ChangePasswordForm,
} from "contracts/auth/password-change.schema";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const PasswordForm = () => {
  const changePassword = useChangePassword();

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(ChangePasswordFormSchema),
    mode: "onSubmit",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submitPassword = async (values: ChangePasswordForm) => {
    changePassword.reset();

    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      passwordForm.reset();
      toast.success("Password changed successfully.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unable to change your password.");
    }
  };

  return (
    <form className="mt-6 max-w-xl space-y-5" onSubmit={passwordForm.handleSubmit(submitPassword)}>
      <div>
        <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
          Current password
        </label>

        <Input
          id="currentPassword"
          type="password"
          className="mt-2"
          autoComplete="current-password"
          aria-invalid={passwordForm.formState.errors.currentPassword ? true : undefined}
          aria-describedby={
            passwordForm.formState.errors.currentPassword ? "currentPassword-error" : undefined
          }
          {...passwordForm.register("currentPassword")}
        />

        {passwordForm.formState.errors.currentPassword && (
          <p id="currentPassword-error" className="mt-2 text-sm text-destructive" role="alert">
            {passwordForm.formState.errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
          New password
        </label>

        <Input
          id="newPassword"
          type="password"
          className="mt-2"
          autoComplete="new-password"
          aria-invalid={passwordForm.formState.errors.newPassword ? true : undefined}
          aria-describedby={
            passwordForm.formState.errors.newPassword ? "newPassword-error" : undefined
          }
          {...passwordForm.register("newPassword")}
        />

        <p className="mt-2 text-xs text-muted-foreground">
          Use at least 10 characters with uppercase, lowercase, number, and special character.
        </p>

        {passwordForm.formState.errors.newPassword && (
          <p id="newPassword-error" className="mt-2 text-sm text-destructive" role="alert">
            {passwordForm.formState.errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Confirm new password
        </label>

        <Input
          id="confirmPassword"
          type="password"
          className="mt-2"
          autoComplete="new-password"
          aria-invalid={passwordForm.formState.errors.confirmPassword ? true : undefined}
          aria-describedby={
            passwordForm.formState.errors.confirmPassword ? "confirmPassword-error" : undefined
          }
          {...passwordForm.register("confirmPassword")}
        />

        {passwordForm.formState.errors.confirmPassword && (
          <p id="confirmPassword-error" className="mt-2 text-sm text-destructive" role="alert">
            {passwordForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="subtle"
        disabled={changePassword.isPending || passwordForm.formState.isSubmitting}
      >
        {changePassword.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Change password
      </Button>
    </form>
  );
};
