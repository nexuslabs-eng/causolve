// @vitest-environment node

import { describe, expect, it } from "vitest";
import { signupAccount, verifyEmailOtp } from "@/features/auth/api/auth";
import { getAuthSession, logout } from "@/features/auth/api/auth-session";
import { getMockVerificationCode } from "@/mocks/utils";
import {
  completeProfile,
  createWorkspace,
  getSignupCompletion,
} from "@/features/auth/api/onboarding";

describe("authentication and onboarding flow", () => {
  it("completes signup and ends the session on logout", async () => {
    expect(await getAuthSession()).toEqual({
      authenticated: false,
      oauthError: null,
    });

    await signupAccount({
      fullName: "John Doe",
      email: "johndoe@gmail.com",
      password: "Causolve!123",
    });

    const pendingSession = await getAuthSession();

    expect(pendingSession).toMatchObject({
      authenticated: true,
      onboarding: {
        nextStep: "VERIFY_EMAIL",
        emailVerified: false,
      },
    });

    const verificationCode = getMockVerificationCode("johndoe@gmail.com");

    expect(verificationCode).toEqual(expect.stringMatching(/^\d{6}$/));
    await verifyEmailOtp({ otp: verificationCode! });

    await createWorkspace({
      name: "Acme Engineering",
      slug: "acme-engineering",
      teamSize: "SIX_TO_TWENTY",
    });

    await completeProfile({
      jobRole: "SOFTWARE_ENGINEER",
    });

    const completion = await getSignupCompletion();

    expect(completion).toMatchObject({
      user: {
        email: "johndoe@gmail.com",
      },
      workspace: {
        name: "Acme Engineering",
        slug: "acme-engineering",
      },
      profile: {
        jobRole: "SOFTWARE_ENGINEER",
      },
      membership: {
        role: "ADMIN",
      },
    });

    expect(await logout()).toEqual({
      loggedOut: true,
    });

    expect(await getAuthSession()).toEqual({
      authenticated: false,
      oauthError: null,
    });
  });
});
