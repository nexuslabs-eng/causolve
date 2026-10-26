import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthAlternateAction } from "@/features/auth/components/AuthAlternateAction";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { SocialAuthButtons, type ProviderHandle } from "@/features/auth/components/SocialAuthButtons";
import { LoginSchema, type LoginValues } from "@/features/auth/schemas/auth.schemas";
import { useState } from "react";
import { useExitToMarketing } from "@/features/auth/hooks/use-exit-to-marketing";
import { completeLogin, getAuthProviderHandles } from "@/features/auth/lib/login";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner"; 
import { getOAuthErrorMessage } from "@/features/auth/lib/oauth-errors";
import { clearOAuthError } from "@/features/auth/queries/auth-session-query-options";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

const Login = () => {
    const navigate = useNavigate();
    const [isProviderLoading, setIsProviderLoading] = useState({ google: false, github: false });
    const { exitToMarketing, isExiting } = useExitToMarketing();
    const { data: session } = useAuthSession();
    const [dismissedOAuthErrorCode, setDismissedOAuthErrorCode] = useState<string | null>(null);

    const oauthErrorCode = session?.authenticated === false ? session.oauthError : null;

    const oauthErrorMessage =
        dismissedOAuthErrorCode === oauthErrorCode
            ? undefined
            : getOAuthErrorMessage(oauthErrorCode);

    const dismissOAuthError = () => {
        setDismissedOAuthErrorCode(oauthErrorCode);
        clearOAuthError();
    }

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting, isValid },
    } = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        mode: "onChange",
        defaultValues: { email: "", password: "" },
    });

    const { signinWithGoogle, signinWithGithub } = getAuthProviderHandles(setIsProviderLoading);

    const providerHandle: ProviderHandle = {
        google: signinWithGoogle,
        github: signinWithGithub
    };

    return (
        <>
            <AuthBackButton onClick={exitToMarketing} disabled={isSubmitting || isExiting} />

            <AuthFormHeader
                title="Welcome back"
                description="Sign in to your Causolve workspace."
            />

            {errors.root?.message ? (
                <AuthErrorBanner onDismiss={() => clearErrors("root")} >
                    {errors.root.message}
                </AuthErrorBanner>
            ) : oauthErrorMessage ? (
                <AuthErrorBanner onDismiss={dismissOAuthError} >
                    {oauthErrorMessage}
                </AuthErrorBanner>
            ) : null}

            <SocialAuthButtons
                mode="login"
                isProviderLoading={isProviderLoading}
                providerHandle={providerHandle}
            />

            <form 
                noValidate 
                onSubmit={
                    handleSubmit(values => 
                        completeLogin(values, navigate, setError)
                    )
                }
            >
                <div className="space-y-5">
                    <Field name="email" invalid={Boolean(errors.email)}>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        {...register("email")}
                        />
                        <FieldError match={Boolean(errors.email)}>
                        {errors.email?.message}
                        </FieldError>
                    </Field>

                    <Field name="password" invalid={Boolean(errors.password)}>
                        <div className="flex items-center justify-between gap-4">
                            <FieldLabel>Password</FieldLabel>
                        
                            <Link
                                to="/forgot-password"
                                className="text-xs font-medium text-primary-bright"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        
                        <PasswordInput
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            {...register("password")}
                        />
                        
                        <FieldError match={Boolean(errors.password)}>
                        {errors.password?.message}
                        </FieldError>
                    </Field>
                </div>

                <AuthSubmitButton
                    disabled={!isValid}
                    loading={isSubmitting}
                    loadingLabel="Signing in"
                >
                    Sign in
                </AuthSubmitButton>
            </form>

            <AuthAlternateAction
                message="New to Causolve?"
                linkLabel="Create an account"
                to="/signup/account"
            />
        </>
    );
};

export default Login;
