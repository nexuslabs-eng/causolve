import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { ServiceSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeService,
  MOCK_ORGANIZATION_ID,
  MOCK_SERVICE_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /organizations/:organizationId/services/:serviceId", () => {
  it("returns the service for any member, regardless of role", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "OBSERVER" }),
    );
    const fakeService = buildFakeService();
    prismaMock.service.findFirst.mockResolvedValue(fakeService);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(200);
    const body = ServiceSchema.parse(response.body);
    expect(body).toMatchObject({ id: fakeService.id, name: fakeService.name });
  });

  it("returns 404 when no service matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    prismaMock.service.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "SERVICE_NOT_FOUND" },
    });
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(401);
  });
});
