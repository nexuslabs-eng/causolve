import { z } from "zod";

export const AuthProviderSchema = z.enum(["PASSWORD", "GOOGLE", "GITHUB"]);

export const EmailVerificationPurposeSchema = z.enum(["SIGNUP", "EMAIL_CHANGE"]);

export type AuthProvider = z.infer<typeof AuthProviderSchema>;
export type EmailVerificationPurpose = z.infer<typeof EmailVerificationPurposeSchema>;
