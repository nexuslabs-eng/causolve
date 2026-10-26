import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import type { Role } from "@causolve/database";
import { requireRole } from "../rbac.middleware.js";

const buildFakeRequest = (role: Role): Request =>
  ({ membership: { organizationId: "org-1", role } }) as unknown as Request;

describe("requireRole", () => {
  it("calls next when the resolved role meets the minimum", () => {
    const req = buildFakeRequest("ADMIN");
    const next = vi.fn() as NextFunction;

    requireRole("ENGINEER")(req, {} as Response, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("throws a 403 FORBIDDEN when the resolved role is below the minimum", () => {
    const req = buildFakeRequest("OBSERVER");
    const next = vi.fn() as NextFunction;

    expect(() => requireRole("ENGINEER")(req, {} as Response, next)).toThrowError(
      expect.objectContaining({ statusCode: 403, code: "FORBIDDEN" }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
