import { queryOptions } from "@tanstack/react-query";
import { getSignupCompletion } from "@/features/auth/api/onboarding";

export const signupCompletionQueryKey = ["onboarding", "completion"] as const;

export const signupCompletionQueryOptions = () =>
  queryOptions({
    queryKey: signupCompletionQueryKey,
    queryFn: getSignupCompletion,
    retry: false,
  });
