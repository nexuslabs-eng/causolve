import { CheckCircle, Loader, Pencil, Save, X, XCircle } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { TEAM_SIZES } from "@/features/auth/fixtures/profile";
import { useGeneralSettingsForm } from "@/features/workspace/hooks/use-general-settings-form";
import type { WorkspaceSettings } from "contracts/settings/workspace-settings.schema";

type Props = {
  settings: WorkspaceSettings | null;
  canEdit: boolean;
};

export const GeneralSettingsForm = ({ settings, canEdit }: Props) => {
  const state = useGeneralSettingsForm(settings, canEdit);

  const {
    form,
    isEditing,
    isCheckingSlugAvailability,
    slugAvailabilityError,
    slugAvailabilityAvailable,
    requestError,
    dismissedError,
    isSaving,
    handleEdit,
    handleCancel,
    handleSubmit,
    dismissError,
  } = state;

  const { control, register, formState } = form;
  const { errors, isDirty, isValid } = formState;

  const controlsDisabled = !canEdit || !isEditing;

  const slugStatus = isCheckingSlugAvailability ? (
    <Loader className="size-4 animate-spin text-muted-foreground" />
  ) : slugAvailabilityError ? (
    <XCircle className="size-4 text-destructive" />
  ) : slugAvailabilityAvailable ? (
    <CheckCircle className="size-4 text-success" />
  ) : null;

  return (
    <>
      <header className="flex min-w-0 items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            General
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage the basic configuration for this workspace.
          </p>
        </div>

        {canEdit && !isEditing && (
          <Button
            className="shrink-0"
            type="button"
            variant="subtle"
            onClick={handleEdit}
          >
            <Pencil />
            Edit
          </Button>
        )}
      </header>

      {requestError && !dismissedError && (
        <div className="mt-5">
          <AuthErrorBanner onDismiss={dismissError}>
            {requestError}
          </AuthErrorBanner>
        </div>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 min-w-0 space-y-6"
      >
        <Field name="name" invalid={isEditing && Boolean(errors.name)}>
          <FieldLabel>Workspace name</FieldLabel>

          <Input
            autoComplete="organization"
            disabled={controlsDisabled}
            {...register("name")}
          />

          {isEditing && (
            <FieldError match={Boolean(errors.name)}>
              {errors.name?.message}
            </FieldError>
          )}
        </Field>

        <Field
          name="slug"
          invalid={isEditing && Boolean(errors.slug || slugAvailabilityError)}
        >
          <FieldLabel>Workspace URL</FieldLabel>

          <div className="relative">
            <Input
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              disabled={controlsDisabled}
              aria-invalid={
                isEditing && Boolean(errors.slug || slugAvailabilityError)
              }
              {...register("slug")}
            />

            {isEditing && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
              >
                {slugStatus}
              </span>
            )}
          </div>

          {isEditing && (
            <>
              <span role="status" aria-live="polite" className="sr-only">
                {isCheckingSlugAvailability
                  ? "Checking workspace URL availability."
                  : (slugAvailabilityError ??
                    (slugAvailabilityAvailable
                      ? "Workspace URL is available."
                      : ""))}
              </span>

              <FieldError match={Boolean(errors.slug || slugAvailabilityError)}>
                {errors.slug?.message ?? slugAvailabilityError}
              </FieldError>
            </>
          )}
        </Field>

        <Field name="teamSize" invalid={isEditing && Boolean(errors.teamSize)}>
          <FieldLabel>Engineering team size</FieldLabel>

          <Controller
            name="teamSize"
            control={control}
            render={({ field }) => (
              <Select
                items={TEAM_SIZES}
                value={field.value ?? null}
                disabled={controlsDisabled}
                onValueChange={(value) => field.onChange(value ?? undefined)}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={isEditing && Boolean(errors.teamSize)}
                >
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>

                <SelectContent>
                  {TEAM_SIZES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {isEditing && (
            <FieldError match={Boolean(errors.teamSize)}>
              {errors.teamSize?.message}
            </FieldError>
          )}
        </Field>

        {isEditing && (
          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X />
              Cancel
            </Button>

            <Button
              type="submit"
              variant="brand"
              disabled={
                !isDirty ||
                !isValid ||
                isCheckingSlugAvailability ||
                Boolean(slugAvailabilityError) ||
                isSaving
              }
            >
              {isSaving ? (
                <>
                  <Loader />
                  Saving...
                </>
              ) : (
                <>
                  <Save />
                  Save changes
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </>
  );
};
