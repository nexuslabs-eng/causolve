import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../../middleware/organization.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import {
  createInvestigation,
  getInvestigation,
} from "./investigation.controller.js";

const router = Router();

router.post(
  "/organizations/:organizationId/incidents/:incidentId/investigation",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ENGINEER"),
  createInvestigation,
);

router.get(
  "/organizations/:organizationId/incidents/:incidentId/investigation",
  isAuthenticated,
  requireOrganizationMembership,
  getInvestigation,
);

export default router;
