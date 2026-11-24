import { useSuspenseQuery } from "@tanstack/react-query";

import { signupCompletionQueryOptions } from "@/features/auth/queries/signup-completion-query-options";

export const useSignupCompletion = () => useSuspenseQuery(signupCompletionQueryOptions());
