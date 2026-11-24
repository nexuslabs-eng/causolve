import { LoginRequestSchema, LoginResponseSchema } from "contracts/auth/login.schema";
import { http, HttpResponse } from "msw";
import {
  apiError,
  authenticateMockAccount,
} from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const login = http.post(
  apiEndpoint("/auth/login"),
  async ({ request }) => {
    const result = LoginRequestSchema.safeParse(await request.json());

    if (!result.success) {
      return HttpResponse.json(
        apiError("INVALID_CREDENTIALS", "Invalid email or password."),
        { status: 401 },
      );
    }

    const session = authenticateMockAccount(result.data.email, result.data.password);

    if (!session)
      return HttpResponse.json(
        apiError("INVALID_CREDENTIALS", "Invalid email or password."),
        { status: 401 },
      );

    if (!session.authenticated) {
      throw new Error("Unable to authenticate the mock account.");
    }

    const user = session.user;

    return HttpResponse.json(
      LoginResponseSchema.parse({
        user,
        onboarding: {
          status: session.onboarding.status,
          nextStep: session.onboarding.nextStep,
        },
      }),
    );
  },
);
