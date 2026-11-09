import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { IncidentEventSchema } from "contracts";
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

describe("POST /organizations/:organizationId/incidents/:incidentId/events", () => {
  it("records a manual timeline note when the user is at least an ENGINEER", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );
    prismaMock.incident.findFirst.mockResolvedValue(buildFakeIncident());
    const fakeEvent = buildFakeIncidentEvent({
      type: "note",
      message: "Paged the payments on-call.",
    });
    prismaMock.incidentEvent.create.mockResolvedValue(fakeEvent);

    const response = await agent
      .post(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
      )
      .send({ type: "note", message: "Paged the payments on-call." });

    expect(response.status).toBe(201);
    const body = IncidentEventSchema.parse(response.body);
    expect(body).toMatchObject({ type: "note", message: fakeEvent.message });
  });

  it("stores arbitrary JSON metadata alongside the note", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );
    prismaMock.incident.findFirst.mockResolvedValue(buildFakeIncident());
    const metadata = { runbookId: "rb-42" };
    prismaMock.incidentEvent.create.mockResolvedValue(
      buildFakeIncidentEvent({ metadata }),
    );

    const response = await agent
      .post(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
      )
      .send({ type: "note", message: "Linked the relevant runbook.", metadata });

    expect(response.status).toBe(201);
    expect(prismaMock.incidentEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ metadata }) }),
    );
  });

  it("returns 404 when no incident matches within this organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );
    prismaMock.incident.findFirst.mockResolvedValue(null);

    const response = await agent
      .post(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
      )
      .send({ type: "note", message: "Paged the payments on-call." });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INCIDENT_NOT_FOUND" },
    });
  });

  it("rejects when the user's role is below ENGINEER", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "OBSERVER" }),
    );

    const response = await agent
      .post(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
      )
      .send({ type: "note", message: "Paged the payments on-call." });

    expect(response.status).toBe(403);
    expect(prismaMock.incidentEvent.create).not.toHaveBeenCalled();
  });

  it("rejects a malformed request body", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent
      .post(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
      )
      .send({ type: "", message: "" });

    expect(response.status).toBe(400);
    expect(prismaMock.incident.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app)
      .post(
        `/organizations/${MOCK_ORGANIZATION_ID}/incidents/${MOCK_INCIDENT_ID}/events`,
      )
      .send({ type: "note", message: "Paged the payments on-call." });

    expect(response.status).toBe(401);
  });
});
