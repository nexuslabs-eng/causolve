import { describe, expect, it } from "vite-plus/test";
import request from "supertest";
import app from "../../../app.js";
import { prismaMock } from "../../../test/mocks/prisma.js";
import { buildFakeUser, buildFakeMembership } from "../../../test/fixtures.js";

describe("DELETE /dev/users", () => {
  it("deletes a user with no organizations", async () => {
    const fakeUser = buildFakeUser();
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);
    prismaMock.membership.findMany.mockResolvedValue([]);

    const response = await request(app).delete(`/dev/users?email=${fakeUser.email}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ deleted: true });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: fakeUser.id },
    });
    expect(prismaMock.organization.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes an organization the user was the sole member of", async () => {
    const fakeUser = buildFakeUser();
    const fakeMembership = buildFakeMembership({ userId: fakeUser.id });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);
    prismaMock.membership.findMany.mockResolvedValue([fakeMembership]);
    prismaMock.membership.count.mockResolvedValue(1);

    const response = await request(app).delete(`/dev/users?email=${fakeUser.email}`);

    expect(response.status).toBe(200);
    expect(prismaMock.organization.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: [fakeMembership.organizationId] } },
    });
  });

  it("leaves an organization alone if other members remain", async () => {
    const fakeUser = buildFakeUser();
    const fakeMembership = buildFakeMembership({ userId: fakeUser.id });
    prismaMock.user.findUnique.mockResolvedValue(fakeUser);
    prismaMock.membership.findMany.mockResolvedValue([fakeMembership]);
    prismaMock.membership.count.mockResolvedValue(2);

    const response = await request(app).delete(`/dev/users?email=${fakeUser.email}`);

    expect(response.status).toBe(200);
    expect(prismaMock.organization.deleteMany).not.toHaveBeenCalled();
  });

  it("returns 404 for an email with no account", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app).delete("/dev/users?email=nobody@example.com");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: "USER_NOT_FOUND" } });
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const response = await request(app).delete("/dev/users?email=not-an-email");

    expect(response.status).toBe(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
