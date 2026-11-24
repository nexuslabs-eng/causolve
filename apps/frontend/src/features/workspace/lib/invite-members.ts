import { RoleSchema } from "contracts/common/enums";
import { JobRoleSchema, type JobRole } from "contracts/onboarding/onboarding.enums";
import type { Role } from "contracts/common/enums";
import { z } from "zod";
import { CreateInvitationRequestSchema } from "contracts/invitations/create-invitation.schema";

export const InviteMembersFormSchema = z
  .object({
    invitations: z.array(CreateInvitationRequestSchema).min(1, "Add at least one invitation."),
  })
  .superRefine(({ invitations }, context) => {
    const seenEmails = new Set<string>();

    invitations.forEach((invitation, index) => {
      const email = invitation.email.trim().toLowerCase();

      if (seenEmails.has(email)) {
        context.addIssue({
          code: "custom",
          path: ["invitations", index, "email"],
          message: "This email has already been added.",
        });
      }

      seenEmails.add(email);
    });
  });

export const ROLE_LABELS: Record<Role, string> = {
  OBSERVER: "Observer",
  ENGINEER: "Engineer",
  INCIDENT_COMMANDER: "Incident commander",
  ADMIN: "Administrator",
};

export const ROLE_OPTIONS = RoleSchema.options.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

export const JOB_ROLES_LABELS: Record<JobRole, string> = {
  FRONTEND_ENGINEER: "Frontend Engineer",
  BACKEND_ENGINEER: "Backend Engineer",
  FULL_STACK_ENGINEER: "Full-stack Engineer",
  SOFTWARE_ENGINEER: "Software Engineer",

  SITE_RELIABILITY_ENGINEER: "Site Reliability Engineer",
  DEVOPS_ENGINEER: "DevOps Engineer",
  PLATFORM_ENGINEER: "Platform Engineer",
  CLOUD_INFRASTRUCTURE_ENGINEER: "Cloud / Infrastructure Engineer",

  SECURITY_ENGINEER: "Security Engineer",
  DATA_ENGINEER: "Data Engineer",
  QA_TEST_ENGINEER: "QA Test Engineer",
  STAFF_ENGINEER: "Staff Engineer",
  PRINCIPAL_ENGINEER: "Principal Engineer",
  ENGINEERING_MANAGER: "Engineering Manager",
  SOLUTIONS_ARCHITECT: "Solutions Architect",
  OTHER: "Other",
};

export const JOB_ROLE_OPTIONS = JobRoleSchema.options.map((jobRole) => ({
  value: jobRole,
  label: JOB_ROLES_LABELS[jobRole],
}));
