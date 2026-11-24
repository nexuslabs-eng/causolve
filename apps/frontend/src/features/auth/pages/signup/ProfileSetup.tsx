import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSetupRequestSchema, type ProfileSetupRequest } from "contracts/onboarding/profile-setup.schema";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeProfile } from "@/features/auth/api/onboarding";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthStepProgress } from "@/features/auth/components/AuthStepProgress";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { JOB_ROLES } from "@/features/auth/fixtures/profile";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { refreshAuthSession } from "@/features/auth/queries/auth-session-query-options";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";

const ProfileSetup = () => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProfileSetupRequest>({
    resolver: zodResolver(ProfileSetupRequestSchema),
    mode: "onChange",
    defaultValues: {
      jobRole: undefined,
    },
  });

  const continueWithProfile = async (values: ProfileSetupRequest) => {
    try {
      await completeProfile(values);
      const session = await refreshAuthSession();

      if (session.authenticated && session.onboarding.nextStep === "COMPLETE") {
        navigate("/signup/complete", { replace: true });
      }
    } catch {
      setError("root", {
        message: "Unable to save your profile. Please try again.",
      });
    }
  };

  return (
    <>
      <AuthBackButton
        disabled={isSubmitting}
        onClick={() => navigate("/signup/workspace")}
      />
      <AuthStepProgress currentStep={3} totalSteps={3} label="Profile" />

      <AuthFormHeader
        title="Tell us about your professional role"
        description="Select the professional role you have in your organization."
        className="mb-8"
      />

      {errors.root?.message && (
        <AuthErrorBanner onDismiss={() => clearErrors("root")}>
          {errors.root.message}
        </AuthErrorBanner>
      )}

      <form noValidate onSubmit={handleSubmit(continueWithProfile)}>
        <div className="space-y-5">
          <Field name="jobRole" invalid={Boolean(errors.jobRole)}>
            <FieldLabel>Professional role</FieldLabel>

            <Controller
              name="jobRole"
              control={control}
              render={({ field }) => (
                <Select
                  items={JOB_ROLES}
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={Boolean(errors.jobRole)}
                  >
                    <SelectValue placeholder="Select your professional role" />
                  </SelectTrigger>

                  <SelectContent>
                    {JOB_ROLES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <FieldError match={Boolean(errors.jobRole)}>
              {errors.jobRole?.message}
            </FieldError>
          </Field>
        </div>

        <AuthSubmitButton
          disabled={!isValid}
          loading={isSubmitting}
          loadingLabel="Saving profile"
        >
          Complete setup
        </AuthSubmitButton>
      </form>
    </>
  );
};

export default ProfileSetup;
