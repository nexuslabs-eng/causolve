import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthAlternateAction } from "@/features/auth/components/AuthAlternateAction";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthStepProgress } from "@/features/auth/components/AuthStepProgress";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { SocialAuthButtons, type ProviderHandle } from "@/features/auth/components/SocialAuthButtons";
import { SignupAccountSchema, type SignupAccountValues } from "@/features/auth/schemas/auth.schemas";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { useExitToMarketing } from "@/features/auth/hooks/use-exit-to-marketing";
import { continueWithAccount, getSignupProviderHandles } from "@/features/auth/lib/account";

const Account = () => {
    const navigate = useNavigate();
    const [isProviderLoading, setIsProviderLoading] = useState({ google: false, github: false });
    const { exitToMarketing, isExiting } = useExitToMarketing();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting, isValid }
    } = useForm<SignupAccountValues>({
        resolver: zodResolver(SignupAccountSchema),
        mode: "onChange",
        defaultValues: {
        email: "",
        fullName: "",
        password: "",
        confirmPassword: ""
        },
    });

    const { signupWithGoogle, signupWithGithub } = getSignupProviderHandles(setIsProviderLoading);

    const providerHandle: ProviderHandle = {
        google: signupWithGoogle,
        github: signupWithGithub
    };

    return (
        <>
            <AuthBackButton
            onClick={exitToMarketing}
            disabled={isSubmitting || isExiting} />

            <AuthStepProgress currentStep={1} totalSteps={3} label="Account" />

            <AuthFormHeader
                title="Create your Causolve account"
                description="Start building a more evidence-aware incident response workflow."
                className="mb-8"
            />

            <SocialAuthButtons
                mode="signup"
                isProviderLoading={isProviderLoading}
                providerHandle={providerHandle} 
            />

            <form
                noValidate
                onSubmit={handleSubmit(values => continueWithAccount(values, navigate, setError))}
            >
                <div className="space-y-5">
                    <Field name="email" invalid={Boolean(errors.email)}>
                        <FieldLabel>Work email</FieldLabel>

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

                    <Field name="fullName" invalid={Boolean(errors.fullName)}>
                        <FieldLabel>Full name</FieldLabel>
                        
                        <Input
                            autoComplete="name"
                            placeholder="Samuel Adeyemi"
                            {...register("fullName")}
                        />

                        <FieldError match={Boolean(errors.fullName)}>
                            {errors.fullName?.message}
                        </FieldError>
                    </Field>

                    <Field name="password" invalid={Boolean(errors.password)}>
                        <FieldLabel>Password</FieldLabel>
                        
                        <PasswordInput
                            autoComplete="new-password"
                            placeholder="Create a password"
                            {...register("password")}
                        />

                        <FieldDescription>Use at least 10 characters with uppercase, lowercase, number and special character.</FieldDescription>
                        
                        <FieldError match={Boolean(errors.password)}>
                            {errors.password?.message}
                        </FieldError>
                    </Field>

                    <Field
                        name="confirmPassword"
                        invalid={Boolean(errors.confirmPassword)}
                    >
                        <FieldLabel>Confirm password</FieldLabel>

                        <PasswordInput
                        autoComplete="new-password"
                        placeholder="Enter your password again"
                        {...register("confirmPassword")}
                        />

                        <FieldError match={Boolean(errors.confirmPassword)}>
                        {errors.confirmPassword?.message}
                        </FieldError>
                    </Field>
                </div>

                <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                    By creating an account, you agree to the{" "}
                    <Link to="/terms" className="text-foreground underline">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-foreground underline">
                        Privacy Policy
                    </Link>
                    .
                </p>

                {errors.root?.message ? (
                    <p
                        role="alert"
                        className="mt-4 text-xs leading-relaxed text-destructive"
                    >
                        {errors.root.message}
                    </p>
                ) : null}

                <AuthSubmitButton 
                    disabled={!isValid} 
                    loading={isSubmitting} 
                    loadingLabel="Creating account"
                >
                    Continue
                </AuthSubmitButton>
            </form>

            <AuthAlternateAction
                message="Already have an account?"
                linkLabel="Sign in"
                to="/login"
            />
        </>
    );
};

export default Account;
