import {
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  ValidateResetTokenResponseSchema,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse,
  type ResetPasswordResponse,
  type ResetPasswordRequest,
  type ValidateResetTokenResponse,
  type PasswordResetToken,
} from "contracts/auth/password-reset.schema";
import {
  ChangePasswordRequestSchema,
  ChangePasswordResponseSchema,
  type ChangePasswordRequest,
  type ChangePasswordResponse,
} from "contracts/auth/password-change.schema";
import { axiosClient } from "@/lib/api/axios-client";

export const forgotPassword = async (
  input: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> => {
  const response = await axiosClient.post<unknown, unknown>(
    "/auth/forgot-password",
    ForgotPasswordRequestSchema.parse(input),
  );

  return ForgotPasswordResponseSchema.parse(response);
};

export const validateResetToken = async (
  token: PasswordResetToken,
): Promise<ValidateResetTokenResponse> => {
  const response = await axiosClient.get<unknown, unknown>("/auth/reset-password/validate", {
    params: { token },
  });

  return ValidateResetTokenResponseSchema.parse(response);
};

export const resetPassword = async (
  input: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  const response = await axiosClient.post<unknown, unknown>(
    "/auth/reset-password",
    ResetPasswordRequestSchema.parse(input),
  );

  return ResetPasswordResponseSchema.parse(response);
};

export const changePassword = async (
  input: ChangePasswordRequest,
): Promise<ChangePasswordResponse> => {
  const payload = ChangePasswordRequestSchema.parse(input);

  const response = await axiosClient.post<unknown, unknown>("/auth/change-password", payload);

  return ChangePasswordResponseSchema.parse(response);
};
