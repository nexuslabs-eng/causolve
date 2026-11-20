import { ResendVerificationCodeResponseSchema } from "contracts";
import { http, HttpResponse } from "msw";
import { apiError, authSession, issueVerificationCode } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const resendVerificationOtp = http.post(
    apiEndpoint("/auth/resend-verification-otp"), 
    () => {
        if (!authSession.authenticated || authSession.user.emailVerified) {
            return HttpResponse.json(
                apiError(
                    "ONBOARDING_STEP_NOT_ALLOWED", 
                    "No pending email verification was found."
                ), 
                { status: 409 }
            );
        }
        
        issueVerificationCode(authSession.user.email);

        return HttpResponse.json(
            ResendVerificationCodeResponseSchema.parse({ 
                accepted: true
            }),
        );
    }
);
