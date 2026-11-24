import { z } from "zod";
import { DateTimeSchema } from "../common/primitives.js";
import { OnboardingStatusSchema, OnboardingStepSchema } from "./onboarding.enums.js";

export const OnboardingStateSchema = z.object({
  status: OnboardingStatusSchema,
  nextStep: OnboardingStepSchema,

  emailVerified: z.boolean(),
  workspaceCreated: z.boolean(),
  profileCompleted: z.boolean(),

  completedAt: DateTimeSchema.nullable(),
});

export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
