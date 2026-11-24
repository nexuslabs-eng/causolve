import {
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  ValidateResetTokenResponseSchema,
} from "contracts/auth/password-reset.schema";
import { http, HttpResponse } from "msw";
import { apiEndpoint } from "@/lib/api/api-config";
import {
  apiError,
  issuePasswordResetToken,
  resetMockPassword,
  validatePasswordResetToken,
} from "@/mocks/utils";

export const forgotPassword = http.post(
  apiEndpoint("/auth/forgot-password"),
  async ({ request }) => {
    const result = ForgotPasswordRequestSchema.safeParse(await request.json());

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_REQUEST", "Enter a valid email."),
        { status: 422 },
      );
    }

    issuePasswordResetToken(result.data.email);

    return HttpResponse.json(
      ForgotPasswordResponseSchema.parse({ accepted: true }),
    );
  },
);

export const validateResetToken = http.get(
  apiEndpoint("/auth/reset-password/validate"),
  ({ request }) => {
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return HttpResponse.json(
        apiError("PASSWORD_RESET_TOKEN_INVALID", "Request a new reset link."),
        { status: 400 },
      );
    }

    const status = validatePasswordResetToken(token);

    if (status === "EXPIRED") {
      return HttpResponse.json(
        apiError("PASSWORD_RESET_TOKEN_EXPIRED", "Request a new reset link."),
        { status: 400 },
      );
    }

    if (status === "INVALID") {
      return HttpResponse.json(
        apiError("PASSWORD_RESET_TOKEN_INVALID", "Request a new reset link."),
        { status: 400 },
      );
    }

    return HttpResponse.json(
      ValidateResetTokenResponseSchema.parse({ valid: true }),
    );
  },
);

export const resetPassword = http.post(
  apiEndpoint("/auth/reset-password"),
  async ({ request }) => {
    const result = ResetPasswordRequestSchema.safeParse(await request.json());

    if (
      !result.success ||
      !resetMockPassword(result.data.token, result.data.password)
    ) {
      return HttpResponse.json(
        apiError("PASSWORD_RESET_TOKEN_INVALID", "Request a new reset link."),
        { status: 400 },
      );
    }

    return HttpResponse.json(
      ResetPasswordResponseSchema.parse({
        reset: true,
        completedAt: new Date().toISOString(),
      }),
    );
  },
);
