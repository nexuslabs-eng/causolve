// @vitest-environment node

import { describe, expect, it } from "vitest";
import { signupAccount } from "@/features/auth/api/auth";
import {
    forgotPassword,
    resetPassword,
} from "@/features/auth/api/password-recovery";
import { getMockPasswordResetToken } from "@/mocks/utils";

describe("password recovery flow", () => {
    it("requests recovery and resets the password", async () => {
        await signupAccount({
            fullName: "John Doe",
            email: "johndoe@gmail.com",
            password: "Causolve!123",
        });

        await expect(
            forgotPassword({
                email: "johndoe@gmail.com",
            }),
        ).resolves.toEqual({
            accepted: true,
        });

        const token = getMockPasswordResetToken("johndoe@gmail.com");

        expect(token).toEqual(expect.any(String));

        const result = await resetPassword({
            token: token!,
            password: "NewCausolve!123",
        });

        expect(result).toMatchObject({
            reset: true,
        });

        expect(result.completedAt).toEqual(expect.any(String));
    });
});
