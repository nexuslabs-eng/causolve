import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyEmailOtpRequestSchema, type VerifyEmailOtpRequest } from "contracts";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Field, FieldError } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationOtp } from "@/features/auth/api/auth";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { isApiClientError } from "@/lib/api/api-client-error";
import { useLogout } from "@/features/auth/hooks/use-logout"; 
import { cn } from "@/lib/utils";
import { verifyEmail } from "@/features/auth/lib/email-verification";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const { data: session } = useAuthSession();
    
    const email = session?.authenticated ? session.user.email : "";
    
    const {
        control,
        handleSubmit,
        setError,
        clearErrors,
        resetField,
        formState: { errors, isSubmitting },
    } = useForm<VerifyEmailOtpRequest>({
        resolver: zodResolver(VerifyEmailOtpRequestSchema),
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues: { otp: "" },
    });
    
    const resend = useMutation({ 
        mutationFn: resendVerificationOtp,
        onSuccess: () => resetField("otp"),
    });
    
    const otp = useWatch({ control, name: "otp" });
    
    const resendError =
        resend.isError &&
            isApiClientError(resend.error) &&
            resend.error.code === "VERIFICATION_RESEND_RATE_LIMITED"
                ? "Please wait for a few seconds before requesting another code."
                : "Unable to resend the code. Please try again."
            
    const restartSignup = useLogout("/signup/account");

    const busy = isSubmitting || resend.isPending || restartSignup.isPending;

    return (
        <>
            <AuthBackButton disabled={busy} onClick={() => restartSignup.mutate()} />

            <AuthFormHeader
                eyebrow="Email verification"
                title="Verify your email"
                description={
                    <>
                        Enter the{" "}
                        <span className="font-medium text-foreground">6-digit</span>{" "}
                        code sent to{" "}
                        <span className="font-medium text-foreground">{email || "your work email"}</span>
                        .
                    </>
                }
            />

            {errors.root?.message && (
                <AuthErrorBanner onDismiss={() => clearErrors("root")} >
                    {errors.root.message}
                </AuthErrorBanner>
            )}

            {resend.isError &&
                <AuthErrorBanner onDismiss={() => resend.reset()}>
                    {resendError}
                </AuthErrorBanner>
            }

            <form
                noValidate
                onSubmit={handleSubmit(values => verifyEmail(values, navigate, setError))}
            >
                <Field name="otp" invalid={Boolean(errors.otp)}>

                    <Controller
                        name="otp"
                        control={control}
                        render={({ field }) => (
                            <InputOTP
                                {...field}
                                id="otp"
                                aria-label="6-digit verification code"
                                aria-invalid={Boolean(errors.otp)}
                                aria-describedby={errors.otp ? "otp-error" : undefined}
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                autoComplete="one-time-code"
                                disabled={isSubmitting || resend.isPending}
                                autoFocus
                                onChange={(nextValue) => {
                                    const codeIsComplete = field.value.length === 6;
                                    const changeWouldReplaceDigit = nextValue.length === 6;

                                    if (codeIsComplete && changeWouldReplaceDigit) {
                                    return;
                                    }

                                    field.onChange(nextValue);
                                }}
                            >
                                <InputOTPGroup>
                                    {Array.from({ length: 6 }, (_, index) => (
                                        <InputOTPSlot
                                        key={index}
                                        index={index}
                                        aria-invalid={Boolean(errors.otp)}
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        )}
                    />

                    <FieldError match={Boolean(errors.otp)} id="otp-error" className="mx-auto">
                        {errors.otp?.message}
                    </FieldError>
                </Field>

                <AuthSubmitButton
                    disabled={otp.length !== 6 || resend.isPending}
                    loading={isSubmitting}
                    loadingLabel="Verifying email"
                >
                    Verify email
                </AuthSubmitButton>
            </form>


            <div className="mt-3 flex flex-col items-center space-y-2">
                <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => resend.mutate()}
                >
                    <RefreshCcw size={8} className={cn(resend.isPending && "animate-spin")} />
                    {resend.isPending ? "Sending code..." : "Resend code" }
                </Button>


                <p role="status" className="text-success text-xs italic">
                    {resend.isSuccess
                        ? "New verification code has been sent."
                        : ""
                    }
                </p>

                <p className="mt-7 text-center text-sm text-muted-foreground">
                    Wrong email address?{" "}
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => restartSignup.mutate()}
                        className="font-medium text-primary-bright transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Start over
                    </button>
                </p>

                {restartSignup.isError && (
                    <p
                        role="alert"
                        className="mt-3 text-center text-sm text-destructive"
                    >
                        Unable to restart signup. Please try again. {restartSignup.error.message}
                    </p>
                )}
            </div>
        </>
    );
};

export default VerifyEmail;
