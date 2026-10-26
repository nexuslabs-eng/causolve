import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordRequestSchema, type ForgotPasswordRequest } from "contracts";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { forgotPassword } from "@/features/auth/api/password-recovery";
import { AuthFormHeader } from "@/features/auth/components/AuthFormHeader";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthAlternateAction } from "@/features/auth/components/AuthAlternateAction";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";

export default function ForgotPassword() {
    const navigate = useNavigate()
    
    const { 
        register, 
        handleSubmit, 
        setError,
        clearErrors,
        formState: { errors, isSubmitting } } =
        useForm<ForgotPasswordRequest>({
            resolver: zodResolver(ForgotPasswordRequestSchema),
            defaultValues: { email: "" }, mode: "onSubmit",
        });

    const submit = async (values: ForgotPasswordRequest) => {
        try {
            await forgotPassword(values);
            navigate("/check-email", { replace: true });
        } catch {
            setError("root", {
                message: "Unable to request a reset link. Please try again."
            });
        }
    };

    return ( 
        <>
            <AuthBackButton disabled={isSubmitting} />

                <AuthFormHeader title="Forgot your password?" description="Enter your account email to request a reset link." />

                {errors.root?.message && (
                    <AuthErrorBanner onDismiss={() => clearErrors("root")} >
                        {errors.root.message}
                    </AuthErrorBanner>
                )}
                
                <form noValidate onSubmit={handleSubmit(submit)}>
                    <Field name="email" invalid={Boolean(errors.email)}>
                        <FieldLabel>Email</FieldLabel>

                        <Input type="email" autoComplete="email" disabled={isSubmitting} {...register("email")} />

                        <FieldError match={Boolean(errors.email)}>{errors.email?.message}</FieldError>
                    </Field>

                    <AuthSubmitButton loading={isSubmitting} loadingLabel="Sending link">Send reset link</AuthSubmitButton>
                </form>

            <AuthAlternateAction message="Remember your password?" linkLabel="Sign in" to="/login" />
        </>
    );
};
