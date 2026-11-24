import { z } from "zod";
import { DateTimeSchema } from "../common/primitives.js";
import { PasswordSchema } from "./password.schema.js";

export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: PasswordSchema,
});

export const ChangePasswordResponseSchema = z.object({
  changed: z.literal(true),
  changedAt: DateTimeSchema,
});

export type ChangePasswordForm = z.infer<typeof ChangePasswordFormSchema>;

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponseSchema>;
