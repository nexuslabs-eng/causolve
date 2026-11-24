import { z } from "zod";
import { DateTimeSchema } from "../common/primitives.js";

export const EmailOtpSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code.");

export const VerifyEmailOtpRequestSchema = z.object({ otp: EmailOtpSchema });

export const VerifyEmailOtpResponseSchema = z.object({
  verified: z.literal(true),
  verifiedAt: DateTimeSchema,
  nextStep: z.literal("CREATE_WORKSPACE"),
});

export const ResendVerificationCodeResponseSchema = z.object({
  accepted: z.literal(true),
});

export type EmailOtp = z.infer<typeof EmailOtpSchema>;
export type VerifyEmailOtpRequest = z.infer<typeof VerifyEmailOtpRequestSchema>;
export type VerifyEmailOtpResponse = z.infer<typeof VerifyEmailOtpResponseSchema>;
export type ResendVerificationCodeResponse = z.infer<typeof ResendVerificationCodeResponseSchema>;
