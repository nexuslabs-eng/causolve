import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { IncidentEventListResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeIncident,
  buildFakeIncidentEvent,
  MOCK_ORGANIZATION_ID,
  MOCK_INCIDENT_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "Causolve!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /organizations/:organizationId/incidents/:incidentId/events", () => {
  it("lists the timeline in chronological order for any member", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "OBSERVER" }),
    );
    prismaMock.incident.findFirst.mockResolvedValue(buildFakeIncident());
    const fakeEvent = buildFakeIncidentEvent();
    prismaMock.incidentEvent.findMany.mockResolvedValue([fakeEvent]);
    prismaMock.incidentEvent.count.mockResolvedValue(1);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
    );

    expect(response.status).toBe(200);
    const body = IncidentEventListResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      page: 1,
      limit: 10,
      totalCount: 1,
      items: [{ id: fakeEvent.id, type: fakeEvent.type }],
    });
    expect(prismaMock.incidentEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "asc" } }),
    );
  });

  it("returns 404 when no incident matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    prismaMock.incident.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INCIDENT_NOT_FOUND" },
    });
  });

  it("rejects invalid pagination parameters", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(buildFakeMembership());
    prismaMock.incident.findFirst.mockResolvedValue(buildFakeIncident());

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events?limit=500`,
    );

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: "INVALID_REQUEST" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
    );

    expect(response.status).toBe(401);
  });
});
