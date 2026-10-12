import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { DeleteServiceResponseSchema } from "contracts";
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

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("DELETE /organizations/:organizationId/services/:serviceId", () => {
  it("deletes the service when the user is an admin", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.service.findFirst.mockResolvedValue(buildFakeService());

    const response = await agent.delete(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(200);
    const body = DeleteServiceResponseSchema.parse(response.body);
    expect(body).toMatchObject({ deleted: true });
    expect(prismaMock.service.delete).toHaveBeenCalledWith({
      where: { id: MOCK_SERVICE_ID },
    });
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent.delete(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(403);
    expect(prismaMock.service.delete).not.toHaveBeenCalled();
  });

  it("returns 404 when no service matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.service.findFirst.mockResolvedValue(null);

    const response = await agent.delete(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "SERVICE_NOT_FOUND" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).delete(
      `/organizations/${MOCK_ORGANIZATION_ID}/services/${MOCK_SERVICE_ID}`,
    );

    expect(response.status).toBe(401);
  });
});
