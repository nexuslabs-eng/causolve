import { Router } from "express";
import { validateFormData } from "../../middleware/formValidate.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { requireOrganizationMembership } from "../../middleware/organization.middleware.js";
import {
  CreateInvitationRequestSchema,
  AcceptInvitationRequestSchema,
} from "contracts";
import {
  acceptInvitation,
  createInvitation,
  listInvitations,
  previewInvitation,
  resendInvitation,
  revokeInvitation,
} from "./invitations.controller.js";

const router = Router();

router.post(
  "/organizations/:organizationId/invitations",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  validateFormData(CreateInvitationRequestSchema),
  createInvitation,
);

router.get(
  "/organizations/:organizationId/invitations",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  listInvitations,
);

router.post(
  "/organizations/:organizationId/invitations/:invitationId/resend",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  resendInvitation,
);

router.post(
  "/organizations/:organizationId/invitations/:invitationId/revoke",
  isAuthenticated,
  requireOrganizationMembership,
  requireRole("ADMIN"),
  revokeInvitation,
);

// Public — the invitee has no session and no organization membership yet,
// so these two intentionally skip every org-scoping middleware above.
router.get("/invitations/preview", previewInvitation);

router.post(
  "/invitations/accept",
  validateFormData(AcceptInvitationRequestSchema),
  acceptInvitation,
);

export default router;
