import { Router } from "express";
import {
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  ResetPasswordRequestSchema,
  SignupRequestSchema,
  VerifyEmailOtpRequestSchema,
} from "contracts";
import { validateFormData } from "../../middleware/formValidate.middleware.js";
import { customRateLimiter } from "../../middleware/rateLimit.middleware.js";
import {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  logoutUser,
  getSession,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from "./auth.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { googleCallBack, googleSignIn } from "./google.controller.js";
import { githubCallBack, githubSignIn } from "./github.controller.js";
import { env } from "../../infrastructure/keys.js";

const router = Router();

router.post(
  "/signup",
  customRateLimiter(env.NODE_ENV === "test" ? 50 : 5, 15), // 5 signups per 15 minutes per IP+UA
  validateFormData(SignupRequestSchema),
  registerUser,
);

router.post(
  "/verify-email",
  customRateLimiter(10, 15, true),
  isAuthenticated,
  validateFormData(VerifyEmailOtpRequestSchema),
  verifyEmail,
);

router.post(
  "/resend-verification-otp",
  customRateLimiter(3, 15, true, "VERIFICATION_RESEND_RATE_LIMITED"), // 3 resends per 15 minutes per session
  isAuthenticated,
  resendVerificationCode,
);

router.post(
  "/login",
  customRateLimiter(10, 15),
  validateFormData(LoginRequestSchema),
  loginUser,
);

router.post("/logout", isAuthenticated, logoutUser);

router.post(
  "/forgot-password",
  customRateLimiter(5, 15),
  validateFormData(ForgotPasswordRequestSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  validateFormData(ResetPasswordRequestSchema),
  resetPassword,
);

router.get("/reset-password/validate", validateResetToken);

router.get("/session", getSession);

router.get("/google", googleSignIn);

router.get("/google/callback", googleCallBack);

router.get("/github", githubSignIn);

router.get("/github/callback", githubCallBack);

export default router;
