import {
  AuthSessionSchema,
  UpdateProfileRequestSchema,
  type UpdateProfileRequest,
} from "contracts";
import { axiosClient } from "@/lib/api/axios-client";

export const updateProfile = async (input: UpdateProfileRequest) => {
  const payload = UpdateProfileRequestSchema.parse(input);

  const response = await axiosClient.patch<unknown, unknown>(
    "/auth/profile",
    payload,
  );

  return AuthSessionSchema.parse(response);
};
