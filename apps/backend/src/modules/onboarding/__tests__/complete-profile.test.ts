import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { ProfileSetupResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser, buildFakeMembership } from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

vi.mock("../../../infrastructure/email.service.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /onboarding/profile", () => {
  it("completes the profile when a workspace already exists", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());

    const response = await agent.post("/onboarding/profile").send({
      jobRole: "SOFTWARE_ENGINEER",
      teamSize: "SIX_TO_TWENTY",
      primaryResponsibility: "APPLICATION_ENGINEERING",
    });

    expect(response.status).toBe(200);
    const body = ProfileSetupResponseSchema.parse(response.body);
    expect(body).toMatchObject({ completed: true, nextStep: "COMPLETE" });
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobRole: "SOFTWARE_ENGINEER",
          teamSize: "SIX_TO_TWENTY",
          primaryResponsibility: "APPLICATION_ENGINEERING",
        }),
      }),
    );
  });

  it("rejects when no workspace has been created yet", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.post("/onboarding/profile").send({
      jobRole: "SOFTWARE_ENGINEER",
      teamSize: "SIX_TO_TWENTY",
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "ONBOARDING_STEP_NOT_ALLOWED" },
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects a malformed request body before touching the database", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    const response = await agent.post("/onboarding/profile").send({
      teamSize: "SIX_TO_TWENTY",
    });

    expect(response.status).toBe(400);
    expect(prismaMock.membership.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).post("/onboarding/profile").send({
      jobRole: "SOFTWARE_ENGINEER",
      teamSize: "SIX_TO_TWENTY",
    });

    expect(response.status).toBe(401);
  });
});
