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
  buildFakeTeam,
  buildFakeService,
  MOCK_ORGANIZATION_ID,
  MOCK_TEAM_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("POST /organizations/:organizationId/services", () => {
  it("creates a service when the user is an admin of the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const fakeService = buildFakeService();
    prismaMock.service.create.mockResolvedValue(fakeService);

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({ name: fakeService.name, environment: fakeService.environment });

    expect(response.status).toBe(201);
    const body = ServiceSchema.parse(response.body);
    expect(body).toMatchObject({
      id: fakeService.id,
      name: fakeService.name,
      environment: fakeService.environment,
    });
  });

  it("creates a service scoped to a team after validating it belongs to the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.team.findFirst.mockResolvedValue(buildFakeTeam());
    const fakeService = buildFakeService({ teamId: MOCK_TEAM_ID });
    prismaMock.service.create.mockResolvedValue(fakeService);

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({
        name: fakeService.name,
        environment: fakeService.environment,
        teamId: MOCK_TEAM_ID,
      });

    expect(response.status).toBe(201);
    expect(prismaMock.team.findFirst).toHaveBeenCalledWith({
      where: { id: MOCK_TEAM_ID, organizationId: MOCK_ORGANIZATION_ID },
    });
    const body = ServiceSchema.parse(response.body);
    expect(body).toMatchObject({ teamId: MOCK_TEAM_ID });
  });

  it("rejects when the given teamId does not belong to this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.team.findFirst.mockResolvedValue(null);

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({ name: "Checkout API", environment: "production", teamId: MOCK_TEAM_ID });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: "TEAM_NOT_FOUND" } });
    expect(prismaMock.service.create).not.toHaveBeenCalled();
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({ name: "Checkout API", environment: "production" });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({ name: "Checkout API", environment: "production" });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ error: { code: "FORBIDDEN" } });
    expect(prismaMock.service.create).not.toHaveBeenCalled();
  });

  it("rejects a duplicate service name within the same organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.service.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.10.0",
        meta: { target: ["organizationId", "name"] },
      }),
    );

    const response = await agent
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({ name: "Checkout API", environment: "production" });

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
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({ name: "a", environment: "production" });

    expect(response.status).toBe(400);
    expect(prismaMock.service.create).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .post(`/organizations/${MOCK_ORGANIZATION_ID}/services`)
      .send({ name: "Checkout API", environment: "production" });

    expect(response.status).toBe(401);
  });
});
