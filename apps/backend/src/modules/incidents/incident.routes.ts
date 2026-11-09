import { Router } from "express";
import {
  CreateIncidentRequestSchema,
  UpdateIncidentRequestSchema,
  CreateIncidentEventRequestSchema,
} from "contracts";
import { validateFormData } from "../../middleware/formValidate.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../../middleware/organization.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import {
  createIncident,
  listIncidents,
  getIncident,
  updateIncident,
  listIncidentEvents,
  createIncidentEvent,
} from "./incident.controller.js";

const router = Router();

router.post(
  "/organizations/:organizationId/incidents",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ENGINEER"),
  validateFormData(CreateIncidentRequestSchema),
  createIncident,
);

router.get(
  "/organizations/:organizationId/incidents",
  isAuthenticated,
  requireOrganizationMembership,
  listIncidents,
);

router.get(
  "/organizations/:organizationId/incidents/:incidentId",
  isAuthenticated,
  requireOrganizationMembership,
  getIncident,
);

router.patch(
  "/organizations/:organizationId/incidents/:incidentId",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ENGINEER"),
  validateFormData(UpdateIncidentRequestSchema),
  updateIncident,
);

router.get(
  "/organizations/:organizationId/incidents/:incidentId/events",
  isAuthenticated,
  requireOrganizationMembership,
  listIncidentEvents,
);

router.post(
  "/organizations/:organizationId/incidents/:incidentId/events",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ENGINEER"),
  validateFormData(CreateIncidentEventRequestSchema),
  createIncidentEvent,
);

export default router;
