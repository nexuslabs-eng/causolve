import { queryOptions } from "@tanstack/react-query";
import type { PasswordResetToken } from "contracts/auth/password-reset.schema";
import { validateResetToken } from "@/features/auth/api/password-recovery";

export const passwordResetTokenQueryOptions = (token: PasswordResetToken) =>
  queryOptions({
    queryKey: ["auth", "password-reset-token", token] as const,
    queryFn: () => validateResetToken(token),
    retry: false,
    staleTime: 0,
  });
