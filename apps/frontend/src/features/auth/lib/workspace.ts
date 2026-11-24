import type { BaseUIEvent } from "@base-ui/react/types";
import { type UseMutationResult } from "@tanstack/react-query";
import { WorkspaceSlugSchema, type WorkspaceSetupRequest } from "contracts/onboarding/workspace-setup.schema";
import type { ChangeEvent } from "react";
import type { UseFormClearErrors, UseFormRegisterReturn, UseFormSetError } from "react-hook-form";
import { isApiClientError } from "@/lib/api/api-client-error";
import type { NavigateFunction } from "react-router-dom";
import { createWorkspace } from "@/features/auth/api/onboarding";
import { refreshAuthSession } from "@/features/auth/queries/auth-session-query-options";

type SetError = UseFormSetError<WorkspaceSetupRequest>
type SlugAvailability = UseMutationResult<{ slug: string; available: boolean; }, Error, string, unknown>

export const getSlugAvailability = async (
    event: BaseUIEvent<ChangeEvent<HTMLInputElement, Element>>,
    setError: SetError,
    clearErrors: UseFormClearErrors<WorkspaceSetupRequest>,
    slugField: UseFormRegisterReturn<"slug">,
    slugAvailability: SlugAvailability
) => {
    slugField.onChange(event);
    slugAvailability.reset();

    const result = WorkspaceSlugSchema.safeParse(event.target.value);

    if (!result.success) return;

    try {
        const availability = await slugAvailability.mutateAsync(result.data);

        if (!availability.available) {
            setError("slug", {
                message: "This workspace URL is already in use."
            });
            return;
        }

        clearErrors("slug");
    } catch {
        setError("slug", {
            message: "Unable to check this workspace URL."
        });
    }
};

export const continueWithWorkspace = async (
    values: WorkspaceSetupRequest,
    navigate: NavigateFunction,
    setError: SetError,

) => {
    try {
        await createWorkspace(values);
        const session = await refreshAuthSession();

        if (session.authenticated && session.onboarding.nextStep === "PROFILE") {
            navigate("/signup/profile", { replace: true });
        }
    } catch (error: unknown) {
        if (isApiClientError(error) && error.code === "WORKSPACE_SLUG_UNAVAILABLE") {
            setError("slug", {
                message: "This workspace URL is already in use.",
            });
            return;
        }
        
        setError("root", {
            message: "unable to create your workspace. Please try again."
        });
    }
};
