import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { anonymousSession, logout } from "@/features/auth/api/auth-session";
import { authSessionQueryKey } from "@/features/auth/queries/auth-session-query-options";
import { signupCompletionQueryKey } from "@/features/auth/queries/signup-completion-query-options";
import { queryClient } from "@/lib/query-client";

export const useLogout = (redirectTo = "/login") => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: logout,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: authSessionQueryKey });
        },
        onSuccess: () => {
            queryClient.setQueryData(authSessionQueryKey, anonymousSession());
            queryClient.removeQueries({ queryKey: signupCompletionQueryKey });

            navigate(redirectTo, { replace: true, flushSync: true });
        },
    });
};
