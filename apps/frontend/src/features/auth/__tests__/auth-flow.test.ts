// @vitest-environment node

import { describe, expect, it } from "vitest";
import { signupAccount, verifyEmailOtp } from "@/features/auth/api/auth";
import { getAuthSession, logout } from "@/features/auth/api/auth-session";
import { completeProfile, createWorkspace, getSignupCompletion } from "@/features/auth/api/onboarding";

describe("authentication and onboarding flow", () => {
    it("completes signup and ends the session on logout", async () => {
        expect(await getAuthSession()).toEqual({
            authenticated: false,
            oauthError: null,
        });

        await signupAccount({
            fullName: "John Doe",
            email: "johndoe@gmail.com",
            password: "ResolveOS!123",
        });

        const pendingSession = await getAuthSession();

        expect(pendingSession).toMatchObject({
            authenticated: true,
            onboarding: {
                nextStep: "VERIFY_EMAIL",
                emailVerified: false,
            },
        });

        await verifyEmailOtp({ otp: "123456" });

        await createWorkspace({
            name: "Acme Engineering",
            slug: "acme-engineering",
        });

        await completeProfile({
            jobRole: "SOFTWARE_ENGINEER",
            teamSize: "SIX_TO_TWENTY",
            primaryResponsibility: "APPLICATION_ENGINEERING",
        });

        const completion = await getSignupCompletion();

        expect(completion).toMatchObject({
            user: {
                email: "johndoe@gmail.com"
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