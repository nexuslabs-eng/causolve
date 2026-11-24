import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthStatusPanel } from "@/features/auth/components/AuthStatusPanel";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { invitationPreviewQueryOptions } from "@/features/auth/queries/invitation-preview-query-options";
import { parseInvitationToken } from "@/features/auth/api/invitations";
import {
  InvitationAcceptanceFormSchema,
  type InvitationAcceptanceFormValues,
} from "@/features/auth/schemas/invitation.schemas";
import { useAcceptInvitation } from "@/features/auth/hooks/use-accept-invitation";
import { isApiClientError } from "@/lib/api/api-client-error";
import { ROLE_LABELS, JOB_ROLES_LABELS } from "@/features/workspace/lib/invite-members";

const getPreviewErrorMessage = (error: unknown) => {
  if (!isApiClientError(error)) {
    return "This invitation could not be loaded.";
  }

  if (error.code === "INVITATION_NOT_FOUND") {
    return "This invitation link is invalid or no longer exists.";
  }

  return "This invitation could not be loaded. Please try again.";
};

const getInvitationStatusMessage = (status: string) => {
  switch (status) {
    case "EXPIRED":
      return "This invitation has expired. Ask the workspace administrator to send a new invitation.";

    case "ACCEPTED":
      return "This invitation has already been accepted.";

    case "REVOKED":
      return "This invitation has been revoked by the workspace administrator.";

    default:
      return "This invitation is no longer available.";
  }
};

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = parseInvitationToken(searchParams.get("token"));
  const acceptInvitationMutation = useAcceptInvitation();

  const invitationPreview = useQuery({
    ...invitationPreviewQueryOptions(token as NonNullable<typeof token>),
    enabled: Boolean(token),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<InvitationAcceptanceFormValues>({
    resolver: zodResolver(InvitationAcceptanceFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submit = async (values: InvitationAcceptanceFormValues) => {
    if (!token) {
      return;
    }

    await acceptInvitationMutation.mutateAsync({
      token,
      fullName: values.fullName,
      password: values.password,
    });
  };

  if (!token) {
    return (
      <AuthStatusPanel
        icon={CheckCircle}
        title="Invalid invitation link"
        description="This invitation link is invalid. Ask the workspace administrator to send you a new invitation."
      />
    );
  }

  if (invitationPreview.isPending) {
    return (
      <AuthStatusPanel
        icon={Loader}
        iconStatus="loading"
        title="Checking invitation"
        description="Validating your invitation link."
      />
    );
  }

  if (invitationPreview.isError) {
    return (
      <AuthStatusPanel
        icon={CheckCircle}
        title="Invitation unavailable"
        description={getPreviewErrorMessage(invitationPreview.error)}
      />
    );
  }

  const invitation = invitationPreview.data;

  if (!invitation || invitation.status !== "PENDING") {
    return (
      <AuthStatusPanel
        icon={CheckCircle}
        title="Invitation unavailable"
        description={getInvitationStatusMessage(invitation?.status ?? "UNAVAILABLE")}
      />
    );
  }

  return (
    <>
      <AuthBackButton disabled={isSubmitting || acceptInvitationMutation.isPending} />

      <AuthFormHeader
        title={`Join ${invitation.organization.name}`}
        description={`Create your Causolve account to join this workspace, invited by ${invitation.invitedBy.fullName}.`}
      />

      {acceptInvitationMutation.isError && (
        <AuthErrorBanner onDismiss={() => acceptInvitationMutation.reset()}>
          {isApiClientError(acceptInvitationMutation.error)
            ? acceptInvitationMutation.error.message
            : "Unable to accept this invitation. Please try again."}
        </AuthErrorBanner>
      )}

      <div className="mb-6 grid gap-4 rounded-md border border-border bg-surface-inset/30 p-4">
        <Field name="invitation-email">
          <FieldLabel htmlFor="invitation-email">Invited email</FieldLabel>

          <Input
            id="invitation-email"
            type="email"
            value={invitation.email}
            readOnly
            aria-readonly="true"
            className="bg-surface-inset/20"
          />
        </Field>

        <Field name="invitation-role">
          <FieldLabel htmlFor="invitation-role">Workspace role</FieldLabel>

          <Input
            id="invitation-role"
            value={ROLE_LABELS[invitation.role]}
            readOnly
            aria-readonly="true"
            className="bg-surface-inset/60"
          />
        </Field>

        <Field name="invitation-role">
          <FieldLabel htmlFor="invitation-role">Professional job role</FieldLabel>

          <Input
            id="invitation-role"
            value={JOB_ROLES_LABELS[invitation.jobRole]}
            readOnly
            aria-readonly="true"
            className="bg-surface-inset/60"
          />
        </Field>
      </div>

      <form noValidate onSubmit={handleSubmit(submit)}>
        <div className="space-y-5">
          <Field name="fullName" invalid={Boolean(errors.fullName)}>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>

            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Samuel Adeyemi"
              disabled={isSubmitting}
              {...register("fullName")}
            />

            <FieldError match={Boolean(errors.fullName)}>{errors.fullName?.message}</FieldError>
          </Field>

          <Field name="password" invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>

            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a password"
              disabled={isSubmitting}
              {...register("password")}
            />

            <FieldError match={Boolean(errors.password)}>{errors.password?.message}</FieldError>
          </Field>

          <Field name="confirmPassword" invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>

            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Enter your password again"
              disabled={isSubmitting}
              {...register("confirmPassword")}
            />

            <FieldError match={Boolean(errors.confirmPassword)}>
              {errors.confirmPassword?.message}
            </FieldError>
          </Field>
        </div>

        <AuthSubmitButton
          loading={isSubmitting || acceptInvitationMutation.isPending}
          loadingLabel="Joining workspace"
          disabled={!isValid || isSubmitting || acceptInvitationMutation.isPending}
        >
          Join workspace
        </AuthSubmitButton>
      </form>
    </>
  );
};

export default AcceptInvitation;
