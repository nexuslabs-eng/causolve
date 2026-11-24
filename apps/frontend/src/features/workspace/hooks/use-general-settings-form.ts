import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  UpdateWorkspaceSettingsRequestSchema,
  type UpdateWorkspaceSettingsRequest,
  type WorkspaceSettings,
} from "contracts/settings/workspace-settings.schema";
import { WorkspaceSlugSchema } from "contracts/onboarding/workspace-setup.schema";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useDebounced } from "@/hooks/use-debounced-value";
import { workspaceSlugAvailabilityQueryOptions } from "@/features/auth/queries/workspace-slug-availability-query-options";
import { useUpdateWorkspaceSettings } from "@/features/workspace/hooks/use-workspace-settings";

const EMPTY_VALUES: UpdateWorkspaceSettingsRequest = {
  name: "",
  slug: "",
  teamSize: "ONE_TO_FIVE",
};

const getDefaultValues = (
  settings: WorkspaceSettings | null,
): UpdateWorkspaceSettingsRequest => {
  if (!settings) {
    return EMPTY_VALUES;
  }

  return {
    name: settings.name,
    slug: settings.slug,
    teamSize: settings.teamSize ?? "ONE_TO_FIVE",
  };
};

export const useGeneralSettingsForm = (
  settings: WorkspaceSettings | null,
  canEdit: boolean,
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  const updateWorkspaceMutation = useUpdateWorkspaceSettings();

  const form = useForm<UpdateWorkspaceSettingsRequest>({
    resolver: zodResolver(UpdateWorkspaceSettingsRequestSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(settings),
  });

  const slug = useWatch({
    control: form.control,
    name: "slug",
  });

  const normalizedSlug = slug.trim().toLowerCase();

  const parsedSlug = WorkspaceSlugSchema.safeParse(normalizedSlug);
  const validSlug = parsedSlug.success ? parsedSlug.data : undefined;

  const defaultSlug = settings?.slug.trim().toLowerCase() ?? "";
  const slugChanged = Boolean(validSlug) && validSlug !== defaultSlug;
  const shouldCheckSlugAvailability =
    canEdit && isEditing && slugChanged;

  const debouncedSlug = useDebounced(
    shouldCheckSlugAvailability ? validSlug : undefined,
    400,
  );

  const slugAvailabilityQuery = useQuery(
    workspaceSlugAvailabilityQueryOptions(debouncedSlug),
  );

  const isDebouncing =
    shouldCheckSlugAvailability && validSlug !== debouncedSlug;

  const hasCurrentAvailabilityResult =
    shouldCheckSlugAvailability && validSlug === debouncedSlug;

  const isCheckingSlugAvailability =
    shouldCheckSlugAvailability &&
    (isDebouncing ||
      (hasCurrentAvailabilityResult && slugAvailabilityQuery.isFetching));

  const currentAvailability = hasCurrentAvailabilityResult
    ? slugAvailabilityQuery.data
    : undefined;

  const slugAvailabilityError =
    !canEdit ||
    !isEditing ||
    !validSlug ||
    isDebouncing ||
    !hasCurrentAvailabilityResult
      ? undefined
      : slugAvailabilityQuery.isError
        ? "Unable to check this workspace URL."
        : currentAvailability?.available === false
          ? "This workspace URL is already in use."
          : undefined;

  useEffect(() => {
    form.reset(getDefaultValues(settings));

  }, [canEdit, form, settings]);

  const handleEdit = () => {
    if (!canEdit) {
      return;
    }

    setDismissedError(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset(getDefaultValues(settings));
    setIsEditing(false);
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (!canEdit) {
      return;
    }

    updateWorkspaceMutation.mutate(values, {
      onSuccess: (savedSettings) => {
        form.reset(getDefaultValues(savedSettings));
        setIsEditing(false);
      },
    });
  });

  return {
    form,
    isEditing: canEdit && isEditing,
    isCheckingSlugAvailability,
    slugAvailabilityError,
    slugAvailabilityAvailable: currentAvailability?.available ?? false,
    requestError:
      updateWorkspaceMutation.error instanceof Error
        ? updateWorkspaceMutation.error.message
        : undefined,
    dismissedError,
    isSaving: updateWorkspaceMutation.isPending,
    handleEdit,
    handleCancel,
    handleSubmit,
    dismissError: () => setDismissedError(true),
  };
};
