import { Router } from "express";
import { CreateTeamRequestSchema, UpdateTeamRequestSchema } from "contracts";
import { validateFormData } from "../../middleware/formValidate.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../../middleware/organization.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { createTeam, listTeams, getTeam, updateTeam, deleteTeam } from "./teams.controller.js";

const router = Router();

router.post(
  "/organizations/:organizationId/teams",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  validateFormData(CreateTeamRequestSchema),
  createTeam,
);

router.get(
  "/organizations/:organizationId/teams",
  isAuthenticated,
  requireOrganizationMembership,
  listTeams,
);

router.get(
  "/organizations/:organizationId/teams/:teamId",
  isAuthenticated,
  requireOrganizationMembership,
  getTeam,
);

router.patch(
  "/organizations/:organizationId/teams/:teamId",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  validateFormData(UpdateTeamRequestSchema),
  updateTeam,
);

router.delete(
  "/organizations/:organizationId/teams/:teamId",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  deleteTeam,
);

export default router;
