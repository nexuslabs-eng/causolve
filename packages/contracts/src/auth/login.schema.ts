import { z } from "zod";
import { NonEmptyStringSchema, IdSchema, EmailSchema } from "../common/primitives.js";
import { OnboardingStatusSchema, OnboardingStepSchema } from "../onboarding/onboarding.enums.js";

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required."),
});

export const LoginResponseSchema = z.object({
  user: z.object({
    id: IdSchema,
    fullName: NonEmptyStringSchema,
    email: z.email(),
    emailVerified: z.boolean(),
  }),
  onboarding: z.object({
    status: OnboardingStatusSchema,
    nextStep: OnboardingStepSchema,
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
