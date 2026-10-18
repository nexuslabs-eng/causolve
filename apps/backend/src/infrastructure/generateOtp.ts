import { env } from "./keys.js";

export const otpExpiryMs = env.OTP_EXPIRY_MS;

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};