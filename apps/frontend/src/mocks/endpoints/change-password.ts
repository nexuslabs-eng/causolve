import {
  ChangePasswordFormSchema,
  ChangePasswordResponseSchema,
  ChangePasswordRequestSchema,
} from "contracts/auth/password-change.schema";
import { http, HttpResponse } from "msw";

import { apiEndpoint } from "@/lib/api/api-config";
import { apiError, authSession, updateMockPassword } from "@/mocks/utils";

export const changePassword = http.post(
  apiEndpoint("/auth/change-password"),
  async ({ request }) => {
    if (!authSession.authenticated) {
      return HttpResponse.json(
        apiError("UNAUTHENTICATED", "You must be signed in."),
        { status: 401 },
      );
    }

    const result = ChangePasswordFormSchema.safeParse(await request.json());

    if (!result.success) {
      return HttpResponse.json(
        apiError(
          "INVALID_PASSWORD_REQUEST",
          "Check the password fields and try again.",
        ),
        { status: 422 },
      );
    }

    const requestPayload = ChangePasswordRequestSchema.parse({
      currentPassword: result.data.currentPassword,
      newPassword: result.data.newPassword,
    });

    if (
      !updateMockPassword(
        authSession.user.email,
        requestPayload.currentPassword,
        requestPayload.newPassword,
      )
    ) {
      return HttpResponse.json(
        apiError("INVALID_PASSWORD", "The current password is incorrect."),
        { status: 400 },
      );
    }

    const changedAt = new Date().toISOString();

    return HttpResponse.json(
      ChangePasswordResponseSchema.parse({
        changed: true,
        changedAt,
      }),
    );
  },
);
