import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { Prisma } from "@resolve-os/database";
import { ServiceSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeService,
  MOCK_ORGANIZATION_ID,
  MOCK_SERVICE_ID,
  MOCK_TEAM_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("PATCH /organizations/:organizationId/services/:serviceId", () => {
  it("updates the service when the user is an admin", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const existingService = buildFakeService();
    prismaMock.service.findFirst.mockResolvedValue(existingService);
    const updatedService = buildFakeService({ environment: "staging" });
    prismaMock.service.update.mockResolvedValue(updatedService);

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`)
      .send({ name: existingService.name, environment: "staging" });

    expect(response.status).toBe(200);
    const body = ServiceSchema.parse(response.body);
    expect(body).toMatchObject({ environment: "staging" });
  });

  it("re-validates teamId against the organization when reassigning", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const existingService = buildFakeService();
    prismaMock.service.findFirst.mockResolvedValue(existingService);
    prismaMock.team.findFirst.mockResolvedValue(null);

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`)
      .send({
        name: existingService.name,
        environment: existingService.environment,
        teamId: MOCK_TEAM_ID,
      });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: "TEAM_NOT_FOUND" } });
    expect(prismaMock.service.update).not.toHaveBeenCalled();
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`)
      .send({ name: "Checkout API", environment: "production" });

    expect(response.status).toBe(403);
    expect(prismaMock.service.update).not.toHaveBeenCalled();
  });

  it("returns 404 when no service matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.service.findFirst.mockResolvedValue(null);

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`)
      .send({ name: "Checkout API", environment: "production" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "SERVICE_NOT_FOUND" },
    });
  });

  it("rejects a duplicate service name within the same organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.service.findFirst.mockResolvedValue(buildFakeService());
    prismaMock.service.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: { target: ["organizationId", "name"] },
      }),
    );

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`)
      .send({ name: "Already Taken", environment: "production" });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: { code: "SERVICE_NAME_TAKEN" },
    });
  });

  it("rejects a malformed request body", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );

    const response = await agent
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`)
      .send({ name: "a", environment: "production" });

    expect(response.status).toBe(400);
    expect(prismaMock.service.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .patch(`/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`)
      .send({ name: "Checkout API", environment: "production" });

    expect(response.status).toBe(401);
  });
});
