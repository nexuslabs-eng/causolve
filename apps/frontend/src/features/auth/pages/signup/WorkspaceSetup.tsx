import { zodResolver } from "@hookform/resolvers/zod";
import { WorkspaceSetupRequestSchema, WorkspaceSlugSchema, type WorkspaceSetupRequest } from "contracts";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthStepProgress } from "@/features/auth/components/AuthStepProgress";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import { continueWithWorkspace } from "@/features/auth/lib/workspace";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { useDebounced } from "@/hooks/use-debounced-value";
import { workspaceSlugAvailabilityQueryOptions } from "../../queries/workspace-slug-availability-query-options";

const WorkspaceSetup = () => {
    const navigate = useNavigate();
    const { data: session } = useAuthSession();

    const workspace = session?.authenticated ? session.activeWorkspace : null;

    const {
        control,
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState:  { errors, isSubmitting, isValid }
    } = useForm<WorkspaceSetupRequest>({
        resolver: zodResolver(WorkspaceSetupRequestSchema),
        mode: "onChange",
        defaultValues:{
            name: workspace?.name ?? "",
            slug: workspace?.slug ?? "",
        }
    });

    const slug = useWatch({ control, name: "slug" });

    const normalizedSlug = slug.trim().toLowerCase();

    const parsedSlug = WorkspaceSlugSchema.safeParse(normalizedSlug);

    const validSlug = parsedSlug.success ? parsedSlug.data : undefined;

    const debouncedSlug = useDebounced(validSlug, 400);

    const slugAvailability = useQuery(workspaceSlugAvailabilityQueryOptions(debouncedSlug));

    const isDebouncing = validSlug !== debouncedSlug;

    const hasCurrentAvailabilityResult =
        Boolean(validSlug) && validSlug === debouncedSlug;

    const isCheckingAvailability =
        Boolean(validSlug) &&
        (isDebouncing ||
            (hasCurrentAvailabilityResult && slugAvailability.isFetching));

    const currentAvailability = hasCurrentAvailabilityResult
        ? slugAvailability.data
        : undefined;

    const availabilityError =
        !validSlug || isDebouncing || !hasCurrentAvailabilityResult
            ? undefined
            : slugAvailability.isError
                ? "Unable to check this workspace URL."
                : currentAvailability?.available === false
                    ? "This workspace URL is already in use."
                    : undefined;

    let slugAvailabilityIcon: ReactNode = null;
    let slugAvailabilityMessage = "";

    if (isCheckingAvailability) {
            slugAvailabilityIcon = (
                <Loader className="size-4 animate-spin text-muted-foreground" />
            );
            slugAvailabilityMessage =
                "Checking workspace URL availability.";
    } else if (currentAvailability) {
            if (currentAvailability.available) {
                slugAvailabilityIcon = (
                    <CheckCircle className="size-4 text-success" />
                );
                slugAvailabilityMessage =
                    "Workspace URL is available.";
            } else {
                slugAvailabilityIcon = (
                    <XCircle className="size-4 text-destructive" />
                );
                slugAvailabilityMessage =
                    "Workspace URL is unavailable.";
            }
    }

    return (
        <>
            <AuthBackButton disabled={isSubmitting} onClick={() => navigate("/signup/account")} />
            
            <AuthStepProgress currentStep={2} totalSteps={3} label="Workspace" />

            <AuthFormHeader
                title="Create your workspace"
                description="Set the name and URL your team will use in Causolve."
                className="mb-8"
            />

            {errors.root?.message && (
                <AuthErrorBanner onDismiss={() => clearErrors("root")} >
                    {errors.root.message}
                </AuthErrorBanner>
            )}

            <form
                noValidate
                onSubmit={handleSubmit(values =>
                    continueWithWorkspace(values ,navigate, setError)
                )}
            >
                <div className="space-y-5">
                    <Field name="name" invalid={Boolean(errors.name)}>
                        <FieldLabel>Workspace name</FieldLabel>

                        <Input autoComplete="organization" placeholder="Acme Engineering" {...register("name")} />

                        <FieldError match={Boolean(errors.name)}>{errors.name?.message}</FieldError>
                    </Field>

                    <Field
                        name="slug"
                        invalid={Boolean(errors.slug || availabilityError)}
                    >
                        <FieldLabel>Workspace URL</FieldLabel>

                        <div className="relative">
                            <Input
                                autoCapitalize="none"
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="acme-engineering"
                                {...register("slug")}
                                
                            />

                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                            >
                                {slugAvailabilityIcon}
                            </span>
                        </div>

                        <span
                            role="status"
                            aria-live="polite"
                            className="sr-only"
                        >
                            {slugAvailabilityMessage}
                        </span>

                        <FieldDescription>
                            Use 3-63 lowercase letters or numbers, separated by single hyphens.
                        </FieldDescription>

                        <FieldError match={Boolean(errors.slug || availabilityError)}>
                            {errors.slug?.message ?? availabilityError}
                        </FieldError>
                    </Field>
                </div>

                <AuthSubmitButton
                    disabled={
                        !isValid ||
                        isCheckingAvailability ||
                        Boolean(availabilityError)
                    }
                    loading={isSubmitting}
                    loadingLabel="Creating workspace"
                >
                    Continue
                </AuthSubmitButton>
            </form>
        </>
    );
};

export default WorkspaceSetup;
