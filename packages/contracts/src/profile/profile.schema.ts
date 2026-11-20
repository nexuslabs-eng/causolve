import { z } from "zod";
import { JobRoleSchema } from "../onboarding/onboarding.enums.js";
import { NonEmptyStringSchema } from "../common/primitives.js";

export const UpdateProfileRequestSchema = z
  .object({
    fullName: NonEmptyStringSchema.optional(),
    jobRole: JobRoleSchema.optional(),
  })
  .refine(
    (value) => value.fullName !== undefined || value.jobRole !== undefined,
    {
      message: "This profile field cannot be empty.",
    },
  );

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
