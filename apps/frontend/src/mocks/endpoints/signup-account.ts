import { SignupRequestSchema, SignupResponseSchema } from "contracts/auth/signup.schema";
import { http, HttpResponse } from "msw";
import { apiError, hasMockAccount, registerMockAccount, resetMockProfile } from "@/mocks/utils";
import { apiEndpoint } from "@/lib/api/api-config";

export const signupAccount = http.post(apiEndpoint("/auth/signup"), async ({ request }) => {
  const result = SignupRequestSchema.safeParse(await request.json());

  if (!result.success)
    return HttpResponse.json(apiError("INVALID_SIGNUP_REQUEST", "Check your account details."), {
      status: 422,
    });

  if (hasMockAccount(result.data.email))
    return HttpResponse.json(apiError("EMAIL_ALREADY_REGISTERED", "Email is already registered."), {
      status: 409,
    });

  resetMockProfile();

  const session = registerMockAccount(result.data);

  const response = SignupResponseSchema.parse({
    userId: session.authenticated ? session.user.id : "",
    email: session.authenticated ? session.user.email : result.data.email,
    emailVerified: false,
    nextStep: "VERIFY_EMAIL",
  });

  return HttpResponse.json(response, { status: 201 });
});
