import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { Send, Loader, Plus, Trash2 } from "lucide-react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { isApiClientError } from "@/lib/api/api-client-error";
import {
  InviteMembersFormSchema,
  ROLE_OPTIONS,
  JOB_ROLE_OPTIONS,
} from "@/features/workspace/lib/invite-members";
import type { InvitationFormProps, InviteMembersFormValues } from "@/types/invitations";

export const InviteMembersForm = ({ onSend, onSent, onCancel, sending }: InvitationFormProps) => {
  const [sendError, setSendError] = useState<string>();

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, dirtyFields, isValid },
  } = useForm<InviteMembersFormValues>({
    resolver: zodResolver(InviteMembersFormSchema),
    mode: "onChange",
    defaultValues: {
      invitations: [
        {
          email: "",
          role: "ENGINEER",
          jobRole: "SOFTWARE_ENGINEER",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invitations",
  });

  const submit: SubmitHandler<InviteMembersFormValues> = async (values) => {
    if (!onSend) {
      return;
    }

    setSendError(undefined);

    try {
      await onSend(values.invitations);
      onSent(values.invitations.length);
    } catch (error: unknown) {
      setSendError(
        isApiClientError(error) ? error.message : "Unable to send invitations. Please try again.",
      );
    }
  };

  const handleCancel = () => {
    reset();
    setSendError(undefined);
    onCancel();
  };

  const addInvitationRow = () => {
    append({
      email: "",
      role: "ENGINEER",
      jobRole: "SOFTWARE_ENGINEER",
    });

    void trigger("invitations");
  };

  const invitationLabel = fields.length === 1 ? "invitation" : "invitations";

  return (
    <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit(submit)}>
      {sendError && (
        <AuthErrorBanner onDismiss={() => setSendError(undefined)}>{sendError}</AuthErrorBanner>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-border bg-surface-inset/30 p-4 sm:items-start"
            >
              <Controller
                name={`invitations.${index}.email`}
                control={control}
                render={({ field: emailField }) => {
                  const emailError = errors.invitations?.[index]?.email?.message;

                  const emailIsDirty = dirtyFields.invitations?.[index]?.email;

                  const showEmailError = Boolean(emailIsDirty && emailError);

                  return (
                    <Field
                      className="sm:col-span-2"
                      name={`invite-email-${field.id}`}
                      invalid={showEmailError}
                    >
                      <FieldLabel htmlFor={`invite-email-${field.id}`}>Email address</FieldLabel>

                      <Input
                        id={`invite-email-${field.id}`}
                        name={emailField.name}
                        ref={emailField.ref}
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        className="h-8"
                        value={emailField.value}
                        onValueChange={(value) => {
                          emailField.onChange(value);
                        }}
                        onBlur={emailField.onBlur}
                        aria-invalid={showEmailError}
                      />

                      <FieldError match={showEmailError}>
                        {showEmailError ? emailError : undefined}
                      </FieldError>
                    </Field>
                  );
                }}
              />

              <Field name={`invite-role-${field.id}`}>
                <FieldLabel htmlFor={`invite-role-${field.id}`}>Workspace role</FieldLabel>

                <Controller
                  name={`invitations.${index}.role`}
                  control={control}
                  render={({ field: roleField }) => (
                    <Select
                      items={ROLE_OPTIONS}
                      value={roleField.value}
                      onValueChange={roleField.onChange}
                    >
                      <SelectTrigger id={`invite-role-${field.id}`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field name={`invite-job-role-${field.id}`}>
                <FieldLabel htmlFor={`invite-job-role-${field.id}`}>Professional role</FieldLabel>

                <Controller
                  name={`invitations.${index}.jobRole`}
                  control={control}
                  render={({ field: jobRoleField }) => (
                    <Select
                      items={JOB_ROLE_OPTIONS}
                      value={jobRoleField.value}
                      onValueChange={jobRoleField.onChange}
                    >
                      <SelectTrigger id={`invite-job-role-${field.id}`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {JOB_ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Remove invitation row ${index + 1}`}
                title="Remove invitation row"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="subtle" onClick={addInvitationRow}>
        <Plus aria-hidden="true" />
        Add another
      </Button>

      {!onSend && (
        <p className="text-sm text-muted-foreground">Invitation sending will be available soon.</p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="subtle" disabled={sending} onClick={handleCancel}>
          Cancel
        </Button>

        <Button type="submit" variant="brand" disabled={!onSend || !isValid || sending}>
          {sending ? (
            <>
              <Loader aria-hidden="true" className="animate-spin" />
              Sending {invitationLabel}
            </>
          ) : (
            <>
              <Send aria-hidden="true" />
              Send {invitationLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
