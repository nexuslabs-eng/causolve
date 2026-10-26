import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ResetPasswordFormSchema,
    PasswordResetTokenSchema,
    type ResetPasswordForm,
    type PasswordResetToken
} from "contracts";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader } from "lucide-react";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthStatusPanel } from "@/features/auth/components/AuthStatusPanel";
import { AuthAlternateAction } from "@/features/auth/components/AuthAlternateAction";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { resetPassword } from "@/features/auth/api/password-recovery";
import { isApiClientError } from "@/lib/api/api-client-error";
import { useQuery } from "@tanstack/react-query";
import { passwordResetTokenQueryOptions } from "@/features/auth/queries/password-reset-token-query-options";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";

const ResetPassword = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const tokenResult = PasswordResetTokenSchema.safeParse(params.get("token"));

    const resetToken: PasswordResetToken | undefined = tokenResult.success ? tokenResult.data : undefined;

    const tokenValidation = useQuery({
        ...passwordResetTokenQueryOptions(resetToken as PasswordResetToken),
        enabled: Boolean(resetToken),
    });

    const { 
        register, 
        handleSubmit, 
        setError,
        clearErrors,
        formState: { errors, isValid, isSubmitting } } = useForm<ResetPasswordForm>({
        resolver: zodResolver(ResetPasswordFormSchema), 
        defaultValues: { password: "", confirmPassword: "" }, 
        mode: "onChange",
    });

    const submit = async (values: ResetPasswordForm) => {
        if (!resetToken) return;

        try {
            await resetPassword({ token: resetToken, password: values.password });

            navigate("/password-updated", {
                replace: true,
                state: { passwordUpdated: true },
            });
        } catch (error: unknown) {
            const code = isApiClientError(error) ? error.code : undefined;
            
            if (code === "PASSWORD_RESET_TOKEN_EXPIRED") {
                setError("root", {
                    message: "This reset link has expired. Request a new one.",
                });
                return;
            }

            if (code === "PASSWORD_RESET_TOKEN_INVALID") {
                setError("root", {
                    message: "This reset link is invalid or has already been used.",
                })
                return;
            }

            setError("root", { 
                message: "Unable to reset your password. Please try again.", 
            }); 
        }
    };

    if (!resetToken) 
        return (
            <>
                <AuthFormHeader 
                    title="Invalid reset link" 
                    description="Request a new password reset link." 
                />
                
                <AuthAlternateAction 
                    message="" 
                    linkLabel="Request new link" 
                    to="/forgot-password" 
                />
            </>
        );

    if (tokenValidation.isPending)
        return (
            <AuthStatusPanel
                icon={Loader}
                iconStatus="loading"
                title="Checking reset link"
                description="Validating your password reset link."
            />
        )

    if (tokenValidation.isError) {
        const code = isApiClientError(tokenValidation.error) ? tokenValidation.error.code : undefined;

        const message =
            code === "PASSWORD_RESET_TOKEN_EXPIRED"
                ? "This reset link has expired. Request a new one."
                : "This reset link is invalid or has already been used."

        return (
            <>
                <AuthFormHeader title="Reset link unavailable" description={message} />

                <AuthAlternateAction message="" linkLabel="Request new link" to="/forgot-password" />
            </>
        )
    }

    if (!tokenValidation.data?.valid)
        return (
            <>
                <AuthFormHeader
                    title="Invalid reset link"
                    description="Request a new password reset link."
                />

                <AuthAlternateAction message="" linkLabel="Request new link" to="/forgot-password" />
            </>
        )
    
    return ( 
        <>
            <AuthBackButton disabled={isSubmitting} onClick={() => navigate("/login")} />

            <AuthFormHeader 
                title="Reset your password" 
                description="Choose a new password for your account." 
            />

            {errors.root?.message && (
                <AuthErrorBanner onDismiss={() => clearErrors("root")} >
                    {errors.root.message}
                </AuthErrorBanner>
            )}

            <form noValidate onSubmit={handleSubmit(submit)}>

                <div className="space-y-5">
                    {(["password", "confirmPassword"] as const).map(name =>
                        <Field key={name} name={name} invalid={Boolean(errors[name])}>
                            <FieldLabel>
                                {name === "password" 
                                    ? "New password" 
                                    : "Confirm password"
                                }
                            </FieldLabel>
                            
                            <PasswordInput 
                                autoComplete="new-password" 
                                disabled={isSubmitting} 
                                {...register(name)} 
                            />
                            
                            <FieldError match={Boolean(errors[name])}>
                                {errors[name]?.message}
                            </FieldError>
                        </Field>
                    )}
                </div>

                <AuthSubmitButton 
                    loading={isSubmitting}
                    disabled={!isValid || isSubmitting}
                    loadingLabel="Updating password"
                >
                    Update password
                </AuthSubmitButton>

            </form>
            
            <AuthAlternateAction 
                message="" 
                linkLabel="Request new link" 
                to="/forgot-password" 
            />
        </>
    );
};

export const PasswordUpdated = () => {
    const location = useLocation();

    if (location.state?.passwordUpdated !== true) {
        return <Navigate to="/forgot-password" replace />;
    }
    
    return (
        <AuthStatusPanel 
            icon={Check} 
            tone="success" 
            title="Password updated" 
            description="You can now sign in with your new password."
            className=""
        >
            <AuthAlternateAction message="" linkLabel="Sign in" to="/login" />
        </AuthStatusPanel>
    );
};

export default ResetPassword;