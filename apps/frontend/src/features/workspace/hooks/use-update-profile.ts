import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/features/workspace/api/profile";
import { authSessionQueryKey } from "@/features/auth/queries/auth-session-query-options";
import { queryClient } from "@/lib/query-client";

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: updateProfile,
    onSuccess: (session) => {
      queryClient.setQueryData(authSessionQueryKey, session);
    },
  });
