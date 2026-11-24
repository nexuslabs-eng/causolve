import { isApiClientError } from "@/lib/api/api-client-error";
import { continueWithGithub, continueWithGoogle, signupAccount } from "@/features/auth/api/auth";
import { refreshAuthSession } from "@/features/auth/queries/auth-session-query-options";
import type { SignupAccountValues } from "@/features/auth/schemas/auth.schemas";
import type { SetIsProviderLoading } from "@/features/auth/components/SocialAuthButtons";
import type { NavigateFunction } from "react-router-dom";
import type { UseFormSetError } from "react-hook-form";

export const getSignupProviderHandles = (setIsProviderLoading: SetIsProviderLoading) => {
  const signupWithGoogle = async () => {
    setIsProviderLoading((prev) => ({ ...prev, google: true }));

    try {
      await continueWithGoogle();
    } catch (err) {
      console.error("Error signing up google auth:", err);
    } finally {
      setIsProviderLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const signupWithGithub = async () => {
    setIsProviderLoading((prev) => ({ ...prev, github: true }));

    try {
      await continueWithGithub();
    } catch (err) {
      console.error("Error singing up github auth:", err);
    } finally {
      setIsProviderLoading((prev) => ({ ...prev, github: false }));
    }
  };

  return { signupWithGoogle, signupWithGithub };
};

type SetError = UseFormSetError<{
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

export const continueWithAccount = async (
  values: SignupAccountValues,
  navigate: NavigateFunction,
  setError: SetError,
) => {
  try {
    await signupAccount({
      email: values.email,
      fullName: values.fullName,
      password: values.password,
    });
    const session = await refreshAuthSession();

    if (session.authenticated && session.onboarding.nextStep === "VERIFY_EMAIL") {
      await navigate("/signup/verify-email", { replace: true });
    }
  } catch (error: unknown) {
    if (isApiClientError(error) && error.code === "EMAIL_ALREADY_REGISTERED") {
      setError("email", {
        message: "An account already exists for this email.",
      });
      return;
    }
    setError("root", {
      message: "Unable to create your account. Please try again.",
    });
  }
};
