import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import request from "supertest";
import { ResetPasswordResponseSchema, ValidateResetTokenResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser } from "../../../test/fixtures.js";
import { destroyAllSessionsForUser } from "../../../infrastructure/session.js";

const { sendEmailMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: sendEmailMock,
}));

// destroyAllSessionsForUser is already replaced with a vi.fn() by the
// global session mock (src/test/mocks/session.ts) — vi.mocked() just gives
// it the right TypeScript type for assertions below.
const destroyAllSessionsForUserMock = vi.mocked(destroyAllSessionsForUser);

beforeEach(() => {
  destroyAllSessionsForUserMock.mockClear();
});

const VALID_TOKEN = "a".repeat(64);
const NEW_PASSWORD = "ResolveOS!456";

describe("POST /auth/reset-password", () => {
  it("resets the password and signs the user out everywhere else", async () => {
    const fakeUser = buildFakeUser({
      passwordResetTokenHash: "irrelevant-because-prisma-is-mocked",
      passwordResetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
    });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app)
      .post("/auth/reset-password")
      .send({ token: VALID_TOKEN, password: NEW_PASSWORD });

    expect(response.status).toBe(200);
    const body = ResetPasswordResponseSchema.parse(response.body);
    expect(body).toMatchObject({ reset: true });

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordResetTokenHash: null,
          passwordResetTokenExpires: null,
        }),
      }),
    );
    expect(destroyAllSessionsForUserMock).toHaveBeenCalledWith(fakeUser.id);
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("rejects an unrecognized token", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/auth/reset-password")
      .send({ token: VALID_TOKEN, password: NEW_PASSWORD });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "PASSWORD_RESET_TOKEN_INVALID" } });
    expect(destroyAllSessionsForUserMock).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    const fakeUser = buildFakeUser({
      passwordResetTokenExpires: new Date(Date.now() - 60 * 1000),
    });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app)
      .post("/auth/reset-password")
      .send({ token: VALID_TOKEN, password: NEW_PASSWORD });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { code: "PASSWORD_RESET_TOKEN_EXPIRED" } });
  });

  it("rejects a malformed request body", async () => {
    const response = await request(app)
      .post("/auth/reset-password")
      .send({ token: "too-short", password: "weak" });

    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("GET /auth/reset-password/validate", () => {
  it("reports a valid, unexpired token as valid", async () => {
    const fakeUser = buildFakeUser({
      passwordResetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
    });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app).get(`/auth/reset-password/validate?token=${VALID_TOKEN}`);

    expect(response.status).toBe(200);
    const body = ValidateResetTokenResponseSchema.parse(response.body);
    expect(body).toMatchObject({ valid: true });
  });

  it("rejects an unrecognized token", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app).get(`/auth/reset-password/validate?token=${VALID_TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: "PASSWORD_RESET_TOKEN_INVALID" },
    });
  });

  it("rejects an expired token", async () => {
    const fakeUser = buildFakeUser({
      passwordResetTokenExpires: new Date(Date.now() - 60 * 1000),
    });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app).get(`/auth/reset-password/validate?token=${VALID_TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: "PASSWORD_RESET_TOKEN_EXPIRED" },
    });
  });

  it("rejects a malformed token without touching the database", async () => {
    const response = await request(app).get("/auth/reset-password/validate?token=too-short");

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: "PASSWORD_RESET_TOKEN_INVALID" },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
