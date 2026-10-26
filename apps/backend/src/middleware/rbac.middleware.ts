import type { NextFunction, Request, Response } from "express";
import type { Role } from "@causolve/database";
import { meetsMinimumRole } from "../policies/rbac.policy.js";
import { ErrorResponse } from "./error.middleware.js";

// Must run after requireOrganizationMembership, which resolves
// req.membership — this only checks the rank already on the request, it
// never touches the database itself.
export const requireRole = (minimumRole: Role) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!meetsMinimumRole(req.membership!.role, minimumRole)) {
      throw new ErrorResponse(
        "You do not have permission to perform this action.",
        403,
        "FORBIDDEN",
      );
    }
    next();
  };
};
