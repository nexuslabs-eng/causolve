import { z } from "zod";
import { DateTimeSchema, EmailSchema } from "../common/primitives.js";
import { PasswordSchema } from "./password.schema.js";

export const PasswordResetTokenSchema = z.string().min(32, "Invalid password reset token.");

export const ForgotPasswordRequestSchema = z.object({
  email: EmailSchema,
});

export const ForgotPasswordResponseSchema = z.object({
  accepted: z.literal(true),
});

export const ResetPasswordFormSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const ResetPasswordRequestSchema = z.object({
  token: PasswordResetTokenSchema,
  password: PasswordSchema,
});

export const ResetPasswordResponseSchema = z.object({
  reset: z.literal(true),
  completedAt: DateTimeSchema,
});

export const ValidateResetTokenResponseSchema = z.object({
  valid: z.literal(true),
});

export type PasswordResetToken = z.infer<typeof PasswordResetTokenSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;
export type ResetPasswordForm = z.infer<typeof ResetPasswordFormSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
export type ValidateResetTokenResponse = z.infer<typeof ValidateResetTokenResponseSchema>;
