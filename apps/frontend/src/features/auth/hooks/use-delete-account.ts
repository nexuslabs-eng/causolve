import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { deleteAccount } from "@/features/auth/api/account";
import { authSessionQueryKey } from "@/features/auth/queries/auth-session-query-options";
import { signupCompletionQueryKey } from "@/features/auth/queries/signup-completion-query-options";
import { queryClient } from "@/lib/query-client";

export const useDeleteAccount = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteAccount,

    onSuccess: async () => {
      queryClient.setQueryData(authSessionQueryKey, {
        authenticated: false,
        oauthError: null,
      });

      queryClient.removeQueries({
        queryKey: signupCompletionQueryKey,
      });

      await navigate("/", {
        replace: true,
        flushSync: true,
      });
    },
  });
};
