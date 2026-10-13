import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import argon2 from "argon2";
import { InvitationListResponseSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeUser,
  buildFakeMembership,
  buildFakeInvitation,
  MOCK_ORGANIZATION_ID,
} from "../../../test/fixtures.js";
import { loginAsFakeUser } from "../../../test/helpers.js";

const CORRECT_PASSWORD = "ResolveOS!123";
let passwordHash: string;

beforeAll(async () => {
  passwordHash = await argon2.hash(CORRECT_PASSWORD);
});

describe("GET /organizations/:organizationId/invitations", () => {
  it("lists invitations for an admin", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const fakeInvitation = buildFakeInvitation();
    prismaMock.invitation.findMany.mockResolvedValue([fakeInvitation]);
    prismaMock.invitation.count.mockResolvedValue(1);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations`,
    );

    expect(response.status).toBe(200);
    const body = InvitationListResponseSchema.parse(response.body);
    expect(body).toMatchObject({
      page: 1,
      limit: 10,
      totalCount: 1,
      totalPages: 1,
      invitations: [{ id: fakeInvitation.id, email: fakeInvitation.email }],
    });
  });

  it("reports an expired-but-still-pending row as EXPIRED", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    const staleInvitation = buildFakeInvitation({
      expiresAt: new Date(Date.now() - 60 * 1000),
    });
    prismaMock.invitation.findMany.mockResolvedValue([staleInvitation]);
    prismaMock.invitation.count.mockResolvedValue(1);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations`,
    );

    expect(response.status).toBe(200);
    const body = InvitationListResponseSchema.parse(response.body);
    expect(body.invitations[0]).toMatchObject({ status: "EXPIRED" });
  });

  it("respects explicit page and limit query params", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );
    prismaMock.invitation.findMany.mockResolvedValue([]);
    prismaMock.invitation.count.mockResolvedValue(25);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations?page=2&limit=5`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      page: 2,
      limit: 5,
      totalCount: 25,
      totalPages: 5,
    });
    expect(prismaMock.invitation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it("rejects invalid pagination parameters", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ADMIN" }),
    );

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations?page=0`,
    );

    expect(response.status).toBe(400);
    expect(prismaMock.invitation.findMany).not.toHaveBeenCalled();
  });

  it("rejects when the user's role is below ADMIN", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ role: "ENGINEER" }),
    );

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations`,
    );

    expect(response.status).toBe(403);
    expect(prismaMock.invitation.findMany).not.toHaveBeenCalled();
  });

  it("rejects when the user has no membership in the organization", async () => {
    const fakeUser = buildFakeUser({ passwordHash });
    const agent = await loginAsFakeUser(app, fakeUser, CORRECT_PASSWORD);

    prismaMock.membership.findFirst.mockResolvedValue(null);

    const response = await agent.get(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "ORGANIZATION_NOT_FOUND" },
    });
  });

  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get(
      `/organizations/${MOCK_ORGANIZATION_ID}/invitations`,
    );

    expect(response.status).toBe(401);
  });
});
