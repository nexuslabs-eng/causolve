import { describe, expect, it, vi } from "vite-plus/test";
import request from "supertest";
import { ForgotPasswordResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser } from "../../../test/fixtures.js";

const { sendEmailMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: sendEmailMock,
}));

// forgotPassword must respond identically regardless of whether the
// account exists (or can even reset a password) — that's the whole
// point of the endpoint, so every scenario below asserts the exact same
// 200 + {accepted: true}, and only the *internal* side effects differ.
describe("POST /auth/forgot-password", () => {
  it("accepts the request and emails a reset link for an existing password account", async () => {
    const fakeUser = buildFakeUser();
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app)
      .post("/auth/forgot-password")
      .send({ email: fakeUser.email });

    expect(response.status).toBe(200);
    const body = ForgotPasswordResponseSchema.parse(response.body);
    expect(body).toMatchObject({ accepted: true });
    expect(prismaMock.user.update).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("gives the identical response for an email with no account, revealing nothing", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "nobody@example.com" });

    expect(response.status).toBe(200);
    const body = ForgotPasswordResponseSchema.parse(response.body);
    expect(body).toMatchObject({ accepted: true });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("gives the identical response for an OAuth-only account with no password to reset", async () => {
    const fakeUser = buildFakeUser({
      passwordHash: null,
      authProvider: "GOOGLE",
    });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app)
      .post("/auth/forgot-password")
      .send({ email: fakeUser.email });

    expect(response.status).toBe(200);
    const body = ForgotPasswordResponseSchema.parse(response.body);
    expect(body).toMatchObject({ accepted: true });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed request body", async () => {
    const response = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
