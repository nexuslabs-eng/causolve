import { Router } from "express";
import { ProfileSetupRequestSchema, WorkspaceSetupRequestSchema } from "contracts";
import { validateFormData } from "../../middleware/formValidate.middleware.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import {
  createWorkspace,
  checkWorkspaceSlugAvailability,
  completeProfile,
  getSignupCompletion,
} from "./onboarding.controller.js";

const router = Router();

router.post(
  "/workspace",
  isAuthenticated,
  validateFormData(WorkspaceSetupRequestSchema),
  createWorkspace,
);

router.get("/workspace-slug-availability", isAuthenticated, checkWorkspaceSlugAvailability);

router.post(
  "/profile",
  isAuthenticated,
  validateFormData(ProfileSetupRequestSchema),
  completeProfile,
);

router.get("/completion", isAuthenticated, getSignupCompletion);

export default router;
