import {
  SignupRequestSchema,
  SignupResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  VerifyEmailOtpRequestSchema,
  VerifyEmailOtpResponseSchema,
  ResendVerificationCodeResponseSchema,
  type SignupRequest,
  type SignupResponse,
  type LoginRequest,
  type LoginResponse,
  type VerifyEmailOtpRequest,
  type VerifyEmailOtpResponse,
  type ResendVerificationCodeResponse,
} from "contracts/auth/index";
import { axiosClient } from "@/lib/api/axios-client";
import { API_BASE_URL } from "@/lib/api/api-config";

export const login = async (input: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosClient.post<unknown, unknown>(
    "/auth/login",
    LoginRequestSchema.parse(input),
  );

  return LoginResponseSchema.parse(response);
};

export const signupAccount = async (input: SignupRequest): Promise<SignupResponse> => {
  const payload = SignupRequestSchema.parse(input);
  const response = await axiosClient.post<unknown, unknown>("/auth/signup", payload);

  return SignupResponseSchema.parse(response);
};

export const verifyEmailOtp = async (
  input: VerifyEmailOtpRequest,
): Promise<VerifyEmailOtpResponse> => {
  const payload = VerifyEmailOtpRequestSchema.parse(input);
  const response = await axiosClient.post<unknown, unknown>("/auth/verify-email", payload);

  return VerifyEmailOtpResponseSchema.parse(response);
};

export const resendVerificationOtp = async (): Promise<ResendVerificationCodeResponse> => {
  const response = await axiosClient.post<unknown, unknown>("/auth/resend-verification-otp");

  return ResendVerificationCodeResponseSchema.parse(response);
};

export const continueWithGoogle = async () => {
  window.location.assign(`${API_BASE_URL}/auth/google`);
};

export const continueWithGithub = async () => {
  window.location.assign(`${API_BASE_URL}/auth/github`);
};
