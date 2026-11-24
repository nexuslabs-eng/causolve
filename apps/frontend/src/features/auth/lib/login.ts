import type { NavigateFunction } from "react-router-dom";
import type { LoginValues } from "../schemas/auth.schemas";
import { continueWithGithub, continueWithGoogle, login } from "../api/auth";
import { refreshAuthSession } from "../queries/auth-session-query-options";
import type { SetIsProviderLoading } from "../components/SocialAuthButtons";
import { onboardingRoutes } from "@/app/routes/constants";
import { isApiClientError } from "@/lib/api/api-client-error";
import type { UseFormSetError } from "react-hook-form";

interface GetAuthProviderHandles {
  signinWithGoogle: () => Promise<void>;
  signinWithGithub: () => Promise<void>;
}

export const getAuthProviderHandles = (
  setIsProviderLoading: SetIsProviderLoading,
): GetAuthProviderHandles => {
  const signinWithGoogle = async () => {
    setIsProviderLoading((prev) => ({ ...prev, google: true }));

    try {
      await continueWithGoogle();
    } catch (err) {
      console.error("Error signing up google auth:", err);
    } finally {
      setIsProviderLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const signinWithGithub = async () => {
    setIsProviderLoading((prev) => ({ ...prev, github: true }));

    try {
      await continueWithGithub();
    } catch (err) {
      console.error("Error singing up github auth:", err);
    } finally {
      setIsProviderLoading((prev) => ({ ...prev, github: false }));
    }
  };

  return { signinWithGoogle, signinWithGithub };
};

export const completeLogin = async (
  values: LoginValues,
  navigate: NavigateFunction,
  setError: UseFormSetError<{
    email: string;
    password: string;
  }>,
) => {
  try {
    await login(values);
    const session = await refreshAuthSession();

    if (!session.authenticated) {
      setError("root", {
        message: "Unable to establish your session. Please try again.",
      });
      return;
    }

    if (session.onboarding.status === "COMPLETED") {
      await navigate("/workspace", { replace: true });
      return;
    }

    await navigate(onboardingRoutes[session.onboarding.nextStep]);
  } catch (error: unknown) {
    const code = isApiClientError(error) ? error.code : undefined;

    setError("root", {
      message:
        code === "EMAIL_NOT_VERIFIED"
          ? "Verify your email before signing in."
          : code === "INVALID_CREDENTIALS"
            ? "Invalid email or password."
            : "Unable to sign in. Please try again.",
    });
  }
};
