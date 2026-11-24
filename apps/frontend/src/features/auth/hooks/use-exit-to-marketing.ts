import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useCallback } from "react";

export const useExitToMarketing = () => {
  const navigate = useNavigate();
  const session = useAuthSession();
  const logout = useLogout("/");

  const exitToMarketing = useCallback(async () => {
    if (session.isPending || logout.isPending) return;

    const result = await session.refetch();

    if (result.isError || result.data?.authenticated !== true) {
      await navigate("/", { replace: true });
      return;
    }

    logout.mutate();
  }, [logout, navigate, session]);

  return { exitToMarketing, isExiting: session.isPending || logout.isPending };
};
