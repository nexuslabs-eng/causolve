import { z } from "zod";
import { NonEmptyStringSchema, IdSchema, EmailSchema } from "../common/primitives.js";
import { PasswordSchema } from "./password.schema.js";

export const SignupAccountFormSchema = z
  .object({
    fullName: NonEmptyStringSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const SignupRequestSchema = z.object({
  fullName: NonEmptyStringSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export const SignupResponseSchema = z.object({
  userId: IdSchema,
  email: z.email(),
  emailVerified: z.literal(false),
  nextStep: z.literal("VERIFY_EMAIL"),
});

export type SignupAccountForm = z.infer<typeof SignupAccountFormSchema>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type SignupResponse = z.infer<typeof SignupResponseSchema>;
