import { zodResolver } from "@hookform/resolvers/zod";
import { WorkspaceSetupRequestSchema, type WorkspaceSetupRequest } from "contracts";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthStepProgress } from "@/features/auth/components/AuthStepProgress";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import { continueWithWorkspace, getSlugAvailability } from "@/features/auth/lib/workspace";
import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { checkWorkspaceSlugAvailability } from "@/features/auth/api/onboarding";

const WorkspaceSetup = () => {
    const navigate = useNavigate();
    const { data: session } = useAuthSession();

    const workspace = session?.authenticated ? session.activeWorkspace : null;

    const {
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

    const slugAvailability = useMutation({ mutationFn: checkWorkspaceSlugAvailability });

    const slugField = register("slug");

    let slugAvailabilityIcon: ReactNode = null;
    let slugAvailabilityMessage = "";

    switch (slugAvailability.status) {
        case "pending":
            slugAvailabilityIcon = (
                <Loader className="size-4 animate-spin text-muted-foreground" />
            );
            slugAvailabilityMessage =
                "Checking workspace URL availability.";
            break;

        case "success":
            if (slugAvailability.data.available) {
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
            break;

        default:
            break;
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

                    <Field name="slug" invalid={Boolean(errors.slug)}>
                        <FieldLabel>Workspace URL</FieldLabel>

                        <div className="relative">
                            <Input
                                autoCapitalize="none"
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="acme-engineering"
                                {...slugField}
                                onChange={(event) =>
                                    getSlugAvailability(
                                        event,
                                        setError,
                                        clearErrors,
                                        slugField,
                                        slugAvailability
                                    )
                                }
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

                        <FieldError match={Boolean(errors.slug)}>{errors.slug?.message}</FieldError>
                    </Field>
                </div>

                {errors.root?.message ? (
                    <p role="alert" className="mt-5 text-xs leading-relaxed text-destructive">{errors.root.message}</p>
                ) : null}

                <AuthSubmitButton
                    disabled={!isValid || slugAvailability.isPending}
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
