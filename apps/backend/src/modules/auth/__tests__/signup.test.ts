import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { SignupResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser } from "../../../test/fixtures.js";

vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("POST /auth/signup", () => {
  it("creates a new user and starts email verification", async () => {
    const fakeUser = buildFakeUser();
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(fakeUser);

    const response = await request(app).post("/auth/signup").send({
      fullName: fakeUser.fullName,
      email: fakeUser.email,
      password: "Causolve!123",
    });

    expect(response.status).toBe(201);

    // Asserts the full response shape against the real contract, not just
    // the handful of fields we bother to list below.
    const body = SignupResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      userId: fakeUser.id,
      email: fakeUser.email,
      emailVerified: false,
      nextStep: "VERIFY_EMAIL",
    });
  });

  it("rejects signup when the email is already registered", async () => {
    const fakeUser = buildFakeUser();
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);

    const response = await request(app).post("/auth/signup").send({
      fullName: fakeUser.fullName,
      email: fakeUser.email,
      password: "Causolve!123",
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "EMAIL_ALREADY_REGISTERED" },
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects a malformed request body before touching the database", async () => {
    const response = await request(app).post("/auth/signup").send({
      fullName: "",
      email: "not-an-email",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
