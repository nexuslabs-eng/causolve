import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { ServiceListResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeService,
  MOCK_ORGANIZATION_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /organizations/:organizationId/services", () => {
  it("lists services for any member, regardless of role", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "OBSERVER" }),
    );
    const fakeService = buildFakeService();
    prismaMock.service.findMany.mockResolvedValue([fakeService]);
    prismaMock.service.count.mockResolvedValue(1);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services`,
    );

    expect(response.status).toBe(200);
    const body = ServiceListResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      page: 1,
      limit: 10,
      totalCount: 1,
      totalPages: 1,
      items: [{ id: fakeService.id, name: fakeService.name }],
    });
  });

  it("respects explicit page and limit query params", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    prismaMock.service.findMany.mockResolvedValue([]);
    prismaMock.service.count.mockResolvedValue(25);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services?page=2&limit=5`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      page: 2,
      limit: 5,
      totalCount: 25,
      totalPages: 5,
    });
    expect(prismaMock.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it("rejects invalid pagination parameters", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services?page=0`,
    );

    expect(response.status).toBe(400);
    expect(prismaMock.service.findMany).not.toHaveBeenCalled();
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      `/organizations/${MOCK_ORGANIZATION_ID}/services`,
    );

    expect(response.status).toBe(401);
  });
});
