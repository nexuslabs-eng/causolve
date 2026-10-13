import { describe, expect, it } from "vitest";
import request from "supertest";
import { InvitationPreviewSchema } from "contracts";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import {
  buildFakeInvitation,
  buildFakeOrganization,
} from "../../../test/fixtures.js";

const VALID_TOKEN = "a".repeat(64);

describe("GET /invitations/preview", () => {
  it("previews a pending invitation without requiring a session", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(
      buildFakeInvitation({ organization: buildFakeOrganization() }),
    );

    const response = await request(app).get(
      `/invitations/preview?token=${VALID_TOKEN}`,
    );

    expect(response.status).toBe(200);
    const body = InvitationPreviewSchema.parse(response.body);
    expect(body).toMatchObject({ status: "PENDING" });
  });

  it("reports an expired-but-still-pending invitation as EXPIRED", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(
      buildFakeInvitation({
        expiresAt: new Date(Date.now() - 60 * 1000),
        organization: buildFakeOrganization(),
      }),
    );

    const response = await request(app).get(
      `/invitations/preview?token=${VALID_TOKEN}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "EXPIRED" });
  });

  it("returns 404 when the token matches no invitation", async () => {
    prismaMock.invitation.findUnique.mockResolvedValue(null);

    const response = await request(app).get(
      `/invitations/preview?token=${VALID_TOKEN}`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: "INVITATION_NOT_FOUND" },
    });
  });

  it("rejects a malformed token without touching the database", async () => {
    const response = await request(app).get(
      "/invitations/preview?token=too-short",
    );

    expect(response.status).toBe(400);
    expect(prismaMock.invitation.findUnique).not.toHaveBeenCalled();
  });
});
