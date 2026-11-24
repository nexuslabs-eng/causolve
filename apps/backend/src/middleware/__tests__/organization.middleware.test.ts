import { describe, expect, it, vi } from "vite-plus/test";
import type { NextFunction, Request, Response } from "express";
import { requireOrganizationMembership } from "../organization.middleware.js";
import { prismaMock } from "../../test/mocks/prisma.js";
import { buildFakeUser, buildFakeMembership } from "../../test/fixtures.js";

const buildFakeRequest = (organizationId: string): Request<{ organizationId: string }> => {
  const fakeUser = buildFakeUser();
  return {
    params: { organizationId },
    user: fakeUser,
  } as unknown as Request<{ organizationId: string }>;
};

describe("requireOrganizationMembership", () => {
  it("attaches the resolved membership and calls next when the user belongs to the organization", async () => {
    const req = buildFakeRequest("org-1");
    const next = vi.fn() as NextFunction;

    prismaMock.membership.findFirst.mockResolvedValue(
      buildFakeMembership({ organizationId: "org-1", role: "ADMIN" }),
    );

    await requireOrganizationMembership(req, {} as Response, next);

    expect(req.membership).toEqual({ organizationId: "org-1", role: "ADMIN" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("throws a 404 ORGANIZATION_NOT_FOUND when the user has no membership there", async () => {
    const req = buildFakeRequest("org-1");
    const next = vi.fn() as NextFunction;

    prismaMock.membership.findFirst.mockResolvedValue(null);

    await expect(requireOrganizationMembership(req, {} as Response, next)).rejects.toMatchObject({
      statusCode: 404,
      code: "ORGANIZATION_NOT_FOUND",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
