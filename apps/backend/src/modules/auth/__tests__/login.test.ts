import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { LoginResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser } from "../../../test/fixtures.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

// A real argon2 hash, computed once, so login tests exercise the actual
// verify() comparison instead of a faked-out result.
beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /auth/login", () => {
  it("logs in with valid credentials", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const userWithMembershipCount = { ...fakeUser, _count: { memberships: 0 } };
    prismaMock.user.findUnique.mockResolvedValue(userWithMembershipCount);

    const response = await request(app).post("/auth/login").send({
      email: fakeUser.email,
      password: CORRECT_PASSWORD,
    });

    expect(response.status).toBe(200);

    const body = LoginResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      user: { id: fakeUser.id, email: fakeUser.email, emailVerified: false },
      onboarding: { status: "IN_PROGRESS", nextStep: "VERIFY_EMAIL" },
    });
  });

  it("rejects login when no account exists for the email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/auth/login").send({
      email: "nobody@example.com",
      password: CORRECT_PASSWORD,
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: { code: "INVALID_CREDENTIALS" },
    });
  });

  it("rejects login with the wrong password, using the same error as a missing account", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app).post("/auth/login").send({
      email: fakeUser.email,
      password: "definitely-the-wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: { code: "INVALID_CREDENTIALS" },
    });
  });

  it("rejects a malformed request body before touching the database", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "not-an-email",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
