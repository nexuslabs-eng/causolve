import { useQuery } from "@tanstack/react-query";
import { authSessionQueryOptions } from "@/features/auth/queries/auth-session-query-options";

export const useAuthSession = () => useQuery(authSessionQueryOptions());
