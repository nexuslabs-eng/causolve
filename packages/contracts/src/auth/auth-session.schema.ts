import { z } from "zod";
import { RoleSchema } from "../common/enums.js";
import { NonEmptyStringSchema, IdSchema } from "../common/primitives.js";
import { OnboardingStateSchema } from "../onboarding/onboarding-state.schema.js";
import { WorkspaceSlugSchema } from "../onboarding/workspace-setup.schema.js";

export const AuthenticatedUserSchema = z.object({
  id: IdSchema,
  fullName: NonEmptyStringSchema,
  email: z.email(),
  emailVerified: z.boolean(),
});

export const OAuthErrorCodeSchema = z.enum([
  "OAUTH_AUTHENTICATION_FAILED",
  "EMAIL_ALREADY_REGISTERED",
]);

export const AnonymousAuthSessionSchema = z.object({
  authenticated: z.literal(false),
  // Set only immediately after a failed OAuth redirect back from Google/GitHub - read once here and cleared server-side, never persists across more than one /auth/session check.
  oauthError: OAuthErrorCodeSchema.nullable(),
});

export const AuthenticatedAuthSessionSchema = z.object({
  authenticated: z.literal(true),
  user: AuthenticatedUserSchema,
  activeWorkspace: z
    .object({
      organizationId: IdSchema,
      name: NonEmptyStringSchema,
      slug: WorkspaceSlugSchema,
    })
    .nullable(),
  membership: z
    .object({
      role: RoleSchema,
    })
    .nullable(),
  onboarding: OnboardingStateSchema,
});

export const AuthSessionSchema = z.discriminatedUnion("authenticated", [
  AnonymousAuthSessionSchema,
  AuthenticatedAuthSessionSchema,
]);

export const LogoutResponseSchema = z.object({
  loggedOut: z.literal(true),
});

export type OAuthErrorCode = z.infer<typeof OAuthErrorCodeSchema>;
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type AnonymousAuthSession = z.infer<typeof AnonymousAuthSessionSchema>;
export type AuthenticatedAuthSession = z.infer<
  typeof AuthenticatedAuthSessionSchema
>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
