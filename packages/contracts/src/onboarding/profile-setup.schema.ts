import { z } from "zod";
import { DateTimeSchema } from "../common/primitives.js";
import { JobRoleSchema } from "./onboarding.enums.js";

export const ProfileSetupRequestSchema = z.object({
  jobRole: JobRoleSchema,
});

export const ProfileSetupResponseSchema = z.object({
  completed: z.literal(true),
  onboardingCompletedAt: DateTimeSchema,
  nextStep: z.literal("COMPLETE"),
});

export type ProfileSetupRequest = z.infer<typeof ProfileSetupRequestSchema>;
export type ProfileSetupResponse = z.infer<typeof ProfileSetupResponseSchema>;
