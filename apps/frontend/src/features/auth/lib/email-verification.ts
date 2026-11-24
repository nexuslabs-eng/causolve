import type { VerifyEmailOtpRequest } from "contracts/auth/email-verification.schema";
import { verifyEmailOtp } from "@/features/auth/api/auth";
import { refreshAuthSession } from "@/features/auth/queries/auth-session-query-options";
import { isApiClientError } from "@/lib/api/api-client-error";
import type { NavigateFunction } from "react-router-dom";
import type { UseFormSetError } from "react-hook-form";

const errorMessage = {
  INVALID_VERIFICATION_CODE: "The verification code is invalid.",
  VERIFICATION_CODE_EXPIRED: "This code has expired. Request a new one.",
  VERIFICATION_ATTEMPTS_EXCEEDED: "Too many attempts. Request a new code.",
} as const;

export const verifyEmail = async (
  values: VerifyEmailOtpRequest,
  navigate: NavigateFunction,
  setError: UseFormSetError<{ otp: string }>,
) => {
  try {
    await verifyEmailOtp(values);
    const session = await refreshAuthSession();

    if (session.authenticated && session.onboarding.nextStep === "CREATE_WORKSPACE") {
      await navigate("/signup/workspace", { replace: true });
    }
  } catch (error: unknown) {
    const code = isApiClientError(error) ? error.code : undefined;

    if (
      code === "INVALID_VERIFICATION_CODE" ||
      code === "VERIFICATION_CODE_EXPIRED" ||
      code === "VERIFICATION_ATTEMPTS_EXCEEDED"
    ) {
      setError("otp", { message: errorMessage[code] });
    } else if (code === "EMAIL_ALREADY_VERIFIED") {
      await navigate("/signup/workspace", { replace: true });
    } else {
      setError("root", {
        message: "Unable to verify your email. Please try again.",
      });
    }
  }
};
