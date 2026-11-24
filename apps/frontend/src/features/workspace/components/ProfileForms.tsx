import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UpdateProfileRequestSchema,
  type UpdateProfileRequest,
} from "contracts/profile/profile.schema";
import type { AuthSession } from "contracts/auth/auth-session.schema";
import { Controller, useForm } from "react-hook-form";
import { useUpdateProfile } from "@/features/workspace/hooks/use-update-profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_ROLES } from "@/features/auth/fixtures/profile";

type AuthenticatedSession = Extract<AuthSession, { authenticated: true }>;

export const ProfileForms = ({ session }: { session: AuthenticatedSession }) => {
  const { user, membership } = session;

  const fullNameForm = useForm<UpdateProfileRequest>({
    resolver: zodResolver(UpdateProfileRequestSchema),
    defaultValues: {
      fullName: user.fullName,
    },
  });

  const jobRoleForm = useForm<UpdateProfileRequest>({
    resolver: zodResolver(UpdateProfileRequestSchema),
    defaultValues: {
      jobRole: membership?.jobRole ?? "ENGINEERING_MANAGER",
    },
  });

  const updateFullName = useUpdateProfile();
  const updateJobRole = useUpdateProfile();

  const submitFullName = async (values: UpdateProfileRequest) => {
    updateFullName.reset();

    if (!values.fullName) return;

    try {
      await updateFullName.mutateAsync({ fullName: values.fullName });
      toast.success("Full name updated successfully.");
    } catch {
      toast.error("Unable to update your full name.");
    }
  };

  const submitJobRole = async (values: UpdateProfileRequest) => {
    updateJobRole.reset();

    if (!values.jobRole) return;

    try {
      await updateJobRole.mutateAsync({ jobRole: values.jobRole });
      toast.success("Professional role updated successfully.");
    } catch {
      toast.error("Unable to update your professional role.");
    }
  };

  return (
    <>
      <section className="border-b border-border pb-6">
        <label htmlFor="fullName" className="text-sm font-medium text-foreground">
          Full name
        </label>

        <form className="mt-2 flex gap-2" onSubmit={fullNameForm.handleSubmit(submitFullName)}>
          <div className="flex min-w-0 flex-col gap-3 @[480px]:flex-row">
            <Input
              id="fullName"
              autoComplete="name"
              aria-invalid={fullNameForm.formState.errors.fullName ? true : undefined}
              aria-describedby={
                fullNameForm.formState.errors.fullName ? "fullName-error" : undefined
              }
              {...fullNameForm.register("fullName")}
            />

            <Button
              type="submit"
              variant="subtle"
              className="h-auto"
              disabled={updateFullName.isPending}
            >
              {updateFullName.isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Check aria-hidden="true" />
              )}
              Save
            </Button>
          </div>
        </form>

        {fullNameForm.formState.errors.fullName && (
          <p id="fullName-error" className="mt-2 text-sm text-destructive" role="alert">
            {fullNameForm.formState.errors.fullName.message}
          </p>
        )}
      </section>

      <section className="border-b border-border pb-6">
        <label htmlFor="jobRole" className="text-sm font-medium text-foreground">
          Professional role
        </label>

        <form className="mt-2 flex gap-2" onSubmit={jobRoleForm.handleSubmit(submitJobRole)}>
          <div className="flex min-w-0 flex-col gap-3 @[480px]:flex-row">
            <Controller
              control={jobRoleForm.control}
              name="jobRole"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(value) => {
                    field.onChange(value === null ? undefined : value);
                  }}
                >
                  <SelectTrigger
                    id="jobRole"
                    aria-invalid={jobRoleForm.formState.errors.jobRole ? true : undefined}
                    aria-describedby={
                      jobRoleForm.formState.errors.jobRole ? "jobRole-error" : undefined
                    }
                    className="h-9!"
                  >
                    <SelectValue placeholder="Select your professional role">
                      {JOB_ROLES.find((role) => role.value === field.value)?.label ??
                        "Select your professional role"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {JOB_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Button
              type="submit"
              variant="subtle"
              disabled={updateJobRole.isPending || !membership}
            >
              {updateJobRole.isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Check aria-hidden="true" />
              )}
              Save
            </Button>
          </div>
        </form>

        {jobRoleForm.formState.errors.jobRole && (
          <p id="jobRole-error" className="mt-2 text-sm text-destructive" role="alert">
            {jobRoleForm.formState.errors.jobRole.message}
          </p>
        )}
      </section>
    </>
  );
};
