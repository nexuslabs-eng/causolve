import type { JobRole, TeamSize } from "contracts/onboarding/onboarding.enums";

export const JOB_ROLES: Array<{
  value: JobRole;
  label: string;
}> = [
  { value: "FRONTEND_ENGINEER", label: "Frontend Engineer" },
  { value: "BACKEND_ENGINEER", label: "Backend Engineer" },
  { value: "FULL_STACK_ENGINEER", label: "Full-stack Engineer" },
  { value: "SOFTWARE_ENGINEER", label: "Software Engineer" },
  {
    value: "SITE_RELIABILITY_ENGINEER",
    label: "Site Reliability Engineer",
  },
  { value: "DEVOPS_ENGINEER", label: "DevOps Engineer" },
  { value: "PLATFORM_ENGINEER", label: "Platform Engineer" },
  {
    value: "CLOUD_INFRASTRUCTURE_ENGINEER",
    label: "Cloud / Infrastructure Engineer",
  },
  { value: "SECURITY_ENGINEER", label: "Security Engineer" },
  { value: "DATA_ENGINEER", label: "Data Engineer" },
  { value: "QA_TEST_ENGINEER", label: "QA / Test Engineer" },
  { value: "STAFF_ENGINEER", label: "Staff Engineer" },
  { value: "PRINCIPAL_ENGINEER", label: "Principal Engineer" },
  { value: "ENGINEERING_MANAGER", label: "Engineering Manager" },
  { value: "SOLUTIONS_ARCHITECT", label: "Solutions Architect" },
  { value: "OTHER", label: "Other" },
];

export const TEAM_SIZES: Array<{ value: TeamSize; label: string }> = [
  { value: "ONE_TO_FIVE", label: "1-5 people" },
  { value: "SIX_TO_TWENTY", label: "6-20 people" },
  { value: "TWENTY_ONE_TO_FIFTY", label: "21-50 people" },
  { value: "FIFTY_ONE_TO_TWO_HUNDRED", label: "51-200 people" },
  { value: "TWO_HUNDRED_PLUS", label: "More than 200 people" },
];
