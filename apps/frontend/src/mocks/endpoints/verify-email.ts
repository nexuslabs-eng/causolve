import {
  VerifyEmailOtpRequestSchema,
  VerifyEmailOtpResponseSchema,
} from "contracts/auth/email-verification.schema";
import { http, HttpResponse } from "msw";
import { apiError, authSession, setAuthSession, verifyMockEmailCode } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const verifyEmail = http.post(apiEndpoint("/auth/verify-email"), async ({ request }) => {
  const result = VerifyEmailOtpRequestSchema.safeParse(await request.json());

  if (
    !result.success ||
    !authSession.authenticated ||
    !verifyMockEmailCode(authSession.user.email, result.data.otp)
  )
    return HttpResponse.json(
      apiError("INVALID_VERIFICATION_CODE", "Enter the valid 6-digit verification code."),
      { status: 400 },
    );

  setAuthSession({
    ...authSession,
    user: {
      ...authSession.user,
      emailVerified: true,
    },
    onboarding: {
      ...authSession.onboarding,
      nextStep: "CREATE_WORKSPACE",
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    },
  });

  const response = VerifyEmailOtpResponseSchema.parse({
    verified: true,
    verifiedAt: new Date().toISOString(),
    nextStep: "CREATE_WORKSPACE",
  });

  return HttpResponse.json(response);
});
