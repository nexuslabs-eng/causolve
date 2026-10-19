import { Request, Response } from "express";
import argon2 from "argon2";
import { prisma } from "@resolve-os/database";
import type { JobRole, TeamSize } from "@resolve-os/database";
import type {
  SignupRequest,
  SignupResponse,
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
  ResendVerificationCodeResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  OnboardingState,
  AuthSession,
  OAuthErrorCode,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ValidateResetTokenResponse,
} from "contracts";
import { PasswordResetTokenSchema } from "contracts";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import {
  findUserByResetToken,
  isResetTokenExpired,
} from "../../infrastructure/passwordResetToken.js";
import {
  sendSuccess,
  sendError,
} from "../../infrastructure/responseHandler.js";
import { logger } from "../../infrastructure/logger.js";
import { env } from "../../infrastructure/keys.js";
import { generateOtp, otpExpiryMs } from "../../infrastructure/generateOtp.js";
import { sendEmail } from "../../infrastructure/email.service.js";
import { verificationCodeTemplate } from "../../infrastructure/templates/verificationCode.template.js";
import { welcomeEmailTemplate } from "../../infrastructure/templates/welcomeEmail.template.js";
import crypto from "node:crypto";
import { passwordResetTemplate } from "../../infrastructure/templates/passwordReset.template.js";
import { passwordChangedTemplate } from "../../infrastructure/templates/passwordChanged.template.js";
import { destroyAllSessionsForUser } from "../../infrastructure/session.js";

export const registerUser = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, SignupRequest>,
    res: Response,
  ): Promise<void> => {
    const { fullName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(
        res,
        409,
        "EMAIL_ALREADY_REGISTERED",
        "An account with this email already exists.",
      );
      return;
    }

    const passwordHash = await argon2.hash(password);
    const plainVerificationCode = generateOtp();
    const hashedVerificationCode = await argon2.hash(plainVerificationCode);
    const verificationCodeExpires = new Date(Date.now() + otpExpiryMs);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        authProvider: "PASSWORD",
        verificationCode: hashedVerificationCode,
        verificationCodeExpires,
      },
    });

    const { subject, text, html } = verificationCodeTemplate(
      user.fullName,
      plainVerificationCode,
    );
    await sendEmail({ to: user.email, subject, text, html });

    if (env.NODE_ENV === "development") {
      logger.info(
        { email: user.email, plainVerificationCode },
        "Verification code (dev convenience log)",
      );
    }

    req.session.userId = user.id;

    const response: SignupResponse = {
      userId: user.id,
      email: user.email,
      emailVerified: false,
      nextStep: "VERIFY_EMAIL",
    };
    sendSuccess(res, 201, response);
  },
);

export const verifyEmail = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, VerifyEmailOtpRequest>,
    res: Response,
  ): Promise<void> => {
    const { otp } = req.body;
    const userId = req.user!.id;

    if (req.user!.emailVerified) {
      sendError(
        res,
        409,
        "EMAIL_ALREADY_VERIFIED",
        "This email is already verified.",
      );
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        verificationCode: true,
        verificationCodeExpires: true,
        verificationAttempts: true,
      },
    });

    if (!user?.verificationCode || !user.verificationCodeExpires) {
      sendError(res, 400, "INVALID_VERIFICATION_CODE", "This code is invalid.");
      return;
    }
    if (user?.verificationCodeExpires < new Date()) {
      sendError(
        res,
        400,
        "VERIFICATION_CODE_EXPIRED",
        "That code has expired.",
      );
      return;
    }

    const MAX_VERIFICATION_ATTEMPTS = 5;
    if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      sendError(
        res,
        429,
        "VERIFICATION_ATTEMPTS_EXCEEDED",
        "Too many incorrect attempts. Request a new code.",
      );
      return;
    }

    const isCodeValid = await argon2.verify(user?.verificationCode, otp);

    if (!isCodeValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { verificationAttempts: { increment: 1 } },
      });
      sendError(res, 400, "INVALID_VERIFICATION_CODE", "That code is invalid");
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    try {
      const { subject, text, html } = welcomeEmailTemplate(
        req.user!.fullName,
        env.CLIENT_URL,
      );
      await sendEmail({ to: req.user!.email, subject, text, html });
    } catch (error) {
      logger.error({ err: error }, "Failed to send welcome email");
    }

    const response: VerifyEmailOtpResponse = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      nextStep: "CREATE_WORKSPACE",
    };
    sendSuccess(res, 200, response);
  },
);

export const resendVerificationCode = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    if (req.user!.emailVerified) {
      sendError(
        res,
        409,
        "EMAIL_ALREADY_VERIFIED",
        "This email is already verified.",
      );
      return;
    }

    const plainVerificationCode = generateOtp();
    const hashedVerificationCode = await argon2.hash(plainVerificationCode);
    const verificationCodeExpires = new Date(Date.now() + otpExpiryMs);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        verificationCode: hashedVerificationCode,
        verificationCodeExpires,
        verificationAttempts: 0,
      },
    });

    const { subject, text, html } = verificationCodeTemplate(
      req.user!.fullName,
      plainVerificationCode,
    );
    await sendEmail({ to: req.user!.email, subject, text, html });

    if (env.NODE_ENV === "development") {
      logger.info(
        { email: req.user!.email, plainVerificationCode },
        "Verification code (dev convenience log)",
      );
    }

    const response: ResendVerificationCodeResponse = { accepted: true };
    sendSuccess(res, 200, response);
  },
);

const getOnboardingProgress = (user: {
  emailVerified: boolean;
  jobRole: JobRole | null;
  teamSize: TeamSize | null;
  hasWorkspace: boolean;
  onboardingCompletedAt: Date | null;
}): OnboardingState => {
  const workspaceCreated = user.hasWorkspace;
  const profileCompleted = user.jobRole !== null && user.teamSize !== null;
  if (!user.emailVerified)
    return {
      status: "IN_PROGRESS",
      nextStep: "VERIFY_EMAIL",
      emailVerified: false,
      workspaceCreated,
      profileCompleted,
      completedAt: null,
    };
  if (!workspaceCreated)
    return {
      status: "IN_PROGRESS",
      nextStep: "CREATE_WORKSPACE",
      emailVerified: true,
      workspaceCreated,
      profileCompleted,
      completedAt: null,
    };
  if (!profileCompleted)
    return {
      status: "IN_PROGRESS",
      nextStep: "PROFILE",
      emailVerified: true,
      workspaceCreated,
      profileCompleted,
      completedAt: null,
    };
  return {
    status: "COMPLETED",
    nextStep: "COMPLETE",
    emailVerified: true,
    workspaceCreated,
    profileCompleted,
    completedAt: user.onboardingCompletedAt?.toISOString() ?? null,
  };
};

export const loginUser = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, LoginRequest>,
    res: Response,
  ): Promise<void> => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        emailVerified: true,
        jobRole: true,
        teamSize: true,
        onboardingCompletedAt: true,
        _count: { select: { memberships: true } },
      },
    });
    if (!user || !user.passwordHash) {
      sendError(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Incorrect email or password.",
      );
      return;
    }
    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      sendError(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Incorrect email or password.",
      );
      return;
    }

    req.session.userId = user.id;

    const response: LoginResponse = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      onboarding: getOnboardingProgress({
        ...user,
        hasWorkspace: user._count.memberships > 0,
      }),
    };
    sendSuccess(res, 200, response);
  },
);

export const logoutUser = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const isProd = env.NODE_ENV === "production";

    req.session.destroy((error) => {
      if (error) {
        sendError(
          res,
          500,
          "LOGOUT_FAILED",
          "Could not log out please try again.",
        );
        return;
      }
      res.clearCookie("sessionId", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      });
      const response: LogoutResponse = { loggedOut: true };
      sendSuccess(res, 200, response);
    });
  },
);

export const getSession = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.session.userId;

    if (!userId) {
      const oauthError = (req.session.oauthError ?? null) as OAuthErrorCode | null;
      delete req.session.oauthError;
      const response: AuthSession = { authenticated: false, oauthError };
      sendSuccess(res, 200, response);
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        emailVerified: true,
        jobRole: true,
        teamSize: true,
        onboardingCompletedAt: true,
        memberships: {
          take: 1,
          select: {
            role: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      //session points at a deleted account - treat identically to anonymous rather than surfacing an error
      const response: AuthSession = { authenticated: false, oauthError: null };
      sendSuccess(res, 200, response);
      return;
    }
    const membership = user.memberships[0] ?? null;

    const response: AuthSession = {
      authenticated: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      activeWorkspace: membership
        ? {
            organizationId: membership.organization.id,
            name: membership.organization.name,
            slug: membership.organization.slug,
          }
        : null,
      membership: membership ? { role: membership.role } : null,
      onboarding: getOnboardingProgress({
        ...user,
        hasWorkspace: membership !== null,
      }),
    };
    sendSuccess(res, 200, response);
  },
);

const PASSWORD_RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
export const forgotPassword = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, ForgotPasswordRequest>,
    res: Response,
  ): Promise<void> => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, passwordHash: true },
    });

    if (user && user.passwordHash) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const passwordResetTokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const passwordResetTokenExpires = new Date(
        Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS,
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetTokenHash, passwordResetTokenExpires },
      });
      const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
      const { subject, text, html } = passwordResetTemplate(
        user.fullName,
        resetUrl,
      );
      await sendEmail({ to: email, subject, text, html });
    }
    const response: ForgotPasswordResponse = { accepted: true };
    sendSuccess(res, 200, response);
  },
);

export const resetPassword = tryCatchWrapper(
  async (
    req: Request<unknown, unknown, ResetPasswordRequest>,
    res: Response,
  ): Promise<void> => {
    const { token, password } = req.body;

    const user = await findUserByResetToken(token);
    if (!user) {
      sendError(
        res,
        400,
        "PASSWORD_RESET_TOKEN_INVALID",
        "This reset link is invalid.",
      );
      return;
    }
    if (isResetTokenExpired(user.passwordResetTokenExpires)) {
      sendError(
        res,
        400,
        "PASSWORD_RESET_TOKEN_EXPIRED",
        "This reset link has expired.",
      );
      return;
    }
    const passwordHash = await argon2.hash(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetTokenExpires: null,
      },
    });

    try {
      await destroyAllSessionsForUser(user.id);
    } catch (error) {
      logger.error(
        { err: error },
        "Failed to destroy existing sessions after password reset",
      );
    }

    try {
      const { subject, text, html } = passwordChangedTemplate(
        user.fullName,
        `${env.CLIENT_URL}/auth/forgot-password`,
      );
      await sendEmail({ to: user.email, subject, text, html });
    } catch (error) {
      logger.error({ err: error }, "Failed to send password-changed email");
    }

    const response: ResetPasswordResponse = {
      reset: true,
      completedAt: new Date().toISOString(),
    };
    sendSuccess(res, 200, response);
  },
);

export const validateResetToken = tryCatchWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const result = PasswordResetTokenSchema.safeParse(req.query.token);

    if (!result.success) {
      sendError(
        res,
        400,
        "PASSWORD_RESET_TOKEN_INVALID",
        "This reset link is invalid.",
      );
      return;
    }
    const user = await findUserByResetToken(result.data);
    if (!user) {
      sendError(
        res,
        400,
        "PASSWORD_RESET_TOKEN_INVALID",
        "This reset link is invalid.",
      );
      return;
    }
    if (isResetTokenExpired(user.passwordResetTokenExpires)) {
      sendError(
        res,
        400,
        "PASSWORD_RESET_TOKEN_EXPIRED",
        "This reset link has expired.",
      );
      return;
    }
    const response: ValidateResetTokenResponse = { valid: true };
    sendSuccess(res, 200, response);
  },
);
