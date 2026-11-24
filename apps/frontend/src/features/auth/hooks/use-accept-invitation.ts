import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { acceptInvitation } from "@/features/auth/api/invitations";
import { refreshAuthSession } from "@/features/auth/queries/auth-session-query-options";

export const useAcceptInvitation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: acceptInvitation,

    onSuccess: async () => {
      await refreshAuthSession();

      await navigate("/workspace", {
        replace: true,
        flushSync: true,
      });
    },
  });
};
