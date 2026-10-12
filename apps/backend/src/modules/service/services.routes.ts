import { Router } from "express";
import {
  CreateServiceRequestSchema,
  UpdateServiceRequestSchema,
} from "contracts";
import { validateFormData } from "../../middleware/formValidate.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { requireOrganizationMembership } from "../../middleware/organization.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import {
  createService,
  listServices,
  getService,
  updateService,
  deleteService,
} from "./services.controller.js";

const router = Router();

router.post(
  "/organizations/:organizationId/services",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  validateFormData(CreateServiceRequestSchema),
  createService,
);

router.get(
  "/organizations/:organizationId/services",
  isAuthenticated,
  requireOrganizationMembership,
  listServices,
);

router.get(
  "/organizations/:organizationId/services/:serviceId",
  isAuthenticated,
  requireOrganizationMembership,
  getService,
);

router.patch(
  "/organizations/:organizationId/services/:serviceId",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  validateFormData(UpdateServiceRequestSchema),
  updateService,
);

router.delete(
  "/organizations/:organizationId/services/:serviceId",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  deleteService,
);

export default router;
