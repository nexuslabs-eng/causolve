import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { ResendVerificationCodeResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser } from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /auth/resend-verification-otp", () => {
  it("issues a new code and resets the attempt count", async () => {
    const fakeUser = buildFakeUser({
      passwordHash,
      emailVerified: false,
      verificationAttempts: 4,
    });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/auth/resend-verification-otp").send();

    expect(response.status).toBe(200);
    const body = ResendVerificationCodeResponseSchema.parse(response.body);
    expect(body).toMatchObject({ accepted: true });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verificationAttempts: 0 }),
      }),
    );
  });

  it("rejects an already-verified account", async () => {
    const fakeUser = buildFakeUser({ passwordHash, emailVerified: true });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/auth/resend-verification-otp").send();

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ error: { code: "EMAIL_ALREADY_VERIFIED" } });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).post("/auth/resend-verification-otp").send();

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: { code: "UNAUTHENTICATED" } });
  });
});
