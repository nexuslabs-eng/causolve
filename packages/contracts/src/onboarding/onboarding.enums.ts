import { z } from "zod";

export const OnboardingStepSchema = z.enum([
  "VERIFY_EMAIL",
  "CREATE_WORKSPACE",
  "PROFILE",
  "COMPLETE",
]);

export const OnboardingStatusSchema = z.enum(["IN_PROGRESS", "COMPLETED"]);

export const JobRoleSchema = z.enum([
  "FRONTEND_ENGINEER",
  "BACKEND_ENGINEER",
  "FULL_STACK_ENGINEER",
  "SOFTWARE_ENGINEER",
  "SITE_RELIABILITY_ENGINEER",
  "DEVOPS_ENGINEER",
  "PLATFORM_ENGINEER",
  "CLOUD_INFRASTRUCTURE_ENGINEER",
  "SECURITY_ENGINEER",
  "DATA_ENGINEER",
  "QA_TEST_ENGINEER",
  "STAFF_ENGINEER",
  "PRINCIPAL_ENGINEER",
  "ENGINEERING_MANAGER",
  "SOLUTIONS_ARCHITECT",
  "OTHER",
]);

export const TeamSizeSchema = z.enum([
  "ONE_TO_FIVE",
  "SIX_TO_TWENTY",
  "TWENTY_ONE_TO_FIFTY",
  "FIFTY_ONE_TO_TWO_HUNDRED",
  "TWO_HUNDRED_PLUS",
]);

export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>;
export type JobRole = z.infer<typeof JobRoleSchema>;
export type TeamSize = z.infer<typeof TeamSizeSchema>;
