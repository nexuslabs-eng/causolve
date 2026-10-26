// @vitest-environment node

import { describe, expect, it } from "vitest";
import { forgotPassword, resetPassword } from "@/features/auth/api/password-recovery";

describe("password recovery flow", () => {
    it("requests recovery and resets the password", async () => {
        await expect(
            forgotPassword({
                email: "johndoe@gmail.com",
            }),
        ).resolves.toEqual({
            accepted: true,
        });

        const result = await resetPassword({
            token: "0123456789abcdef0123456789abcdef",
            password: "NewCausolve!123",
        });

        expect(result).toMatchObject({
            reset: true,
        });

        expect(result.completedAt).toEqual(expect.any(String));
    });
});