import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { VerifyEmailOtpResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser } from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
const CORRECT_OTP = "123456";
let passwordHash: string;
let hashedOtp: string;

// Real hashes, computed once — verifyEmail runs a genuine argon2.verify()
// comparison against the submitted OTP, same reasoning as login.test.ts.
beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
  hashedOtp = await argon2.hash(CORRECT_OTP);
});

describe("POST /auth/verify-email", () => {
  it("verifies the email when the code is correct", async () => {
    const fakeUser = buildFakeUser({
      passwordHash,
      emailVerified: false,
      verificationCode: hashedOtp,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      verificationAttempts: 0,
    });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/auth/verify-email").send({ otp: CORRECT_OTP });

    expect(response.status).toBe(200);
    const body = VerifyEmailOtpResponseSchema.parse(response.body);
    expect(body).toMatchObject({ verified: true, nextStep: "CREATE_WORKSPACE" });
  });

  it("rejects an incorrect code and records the attempt", async () => {
    const fakeUser = buildFakeUser({
      passwordHash,
      emailVerified: false,
      verificationCode: hashedOtp,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      verificationAttempts: 0,
    });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/auth/verify-email").send({ otp: "000000" });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "INVALID_VERIFICATION_CODE" } });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { verificationAttempts: { increment: 1 } },
      }),
    );
  });

  it("rejects an expired code", async () => {
    const fakeUser = buildFakeUser({
      passwordHash,
      emailVerified: false,
      verificationCode: hashedOtp,
      verificationCodeExpires: new Date(Date.now() - 60 * 1000),
      verificationAttempts: 0,
    });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/auth/verify-email").send({ otp: CORRECT_OTP });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "VERIFICATION_CODE_EXPIRED" } });
  });

  it("rejects once too many incorrect attempts have been made", async () => {
    const fakeUser = buildFakeUser({
      passwordHash,
      emailVerified: false,
      verificationCode: hashedOtp,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      verificationAttempts: 5,
    });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/auth/verify-email").send({ otp: CORRECT_OTP });

    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({ error: { code: "VERIFICATION_ATTEMPTS_EXCEEDED" } });
  });

  it("rejects an already-verified account", async () => {
    const fakeUser = buildFakeUser({
      passwordHash,
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
      verificationAttempts: 0,
    });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/auth/verify-email").send({ otp: CORRECT_OTP });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ error: { code: "EMAIL_ALREADY_VERIFIED" } });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).post("/auth/verify-email").send({ otp: CORRECT_OTP });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: "UNAUTHENTICATED" } });
  });
});
