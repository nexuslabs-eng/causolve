import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/features/auth/api/password-recovery";

export const useChangePassword = () =>
  useMutation({
    mutationFn: changePassword,
  });
