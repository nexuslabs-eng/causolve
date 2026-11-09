# Auth API

Base path: `/auth`. All request/response shapes are defined as Zod schemas
in `packages/contracts/src/auth/`, imported by both the backend and the
frontend — these docs describe behavior; the contracts package is still
the source of truth for exact field types and validation rules.

Session-based auth: successful signup/login/OAuth sets a `sessionId`
cookie (via `express-session`, Postgres-backed). Routes marked
**Auth: required** read `req.session.userId` and reject with `401
UNAUTHENTICATED` if there's no valid session.

------------------------------------------------------------------------

## POST /auth/signup

**Auth:** not required · Rate limit: 5 / 15 min per IP+UA

**Request body** (`SignupRequestSchema`)

| Field      | Type   | Notes                                  |
| ---------- | ------ | --------------------------------------- |
| `fullName` | string | non-empty                               |
| `email`    | string | valid email                             |
| `password` | string | ≥10 chars, upper/lower/digit/special, no spaces |

**Success — `201`**

```json
{ "userId": "...", "email": "...", "emailVerified": false, "nextStep": "VERIFY_EMAIL" }
```

**Errors**

| Status | Code                       | Meaning                          |
| ------ | -------------------------- | -------------------------------- |
| 400    | (validation)                | malformed body                   |
| 409    | `EMAIL_ALREADY_REGISTERED` | an account already uses this email |

------------------------------------------------------------------------

## POST /auth/verify-email

**Auth:** required · Rate limit: 10 / 15 min per session

**Request body** (`VerifyEmailOtpRequestSchema`): `{ otp: string }` — 6 digits.

**Success — `200`**

```json
{ "verified": true, "verifiedAt": "...", "nextStep": "CREATE_WORKSPACE" }
```

**Errors**

| Status | Code                              | Meaning                                  |
| ------ | --------------------------------- | ------------------------------------------ |
| 400    | `INVALID_VERIFICATION_CODE`       | wrong code (also increments attempt count) |
| 400    | `VERIFICATION_CODE_EXPIRED`       | code's 10-minute window has passed        |
| 409    | `EMAIL_ALREADY_VERIFIED`          | already verified                          |
| 429    | `VERIFICATION_ATTEMPTS_EXCEEDED`  | 5 incorrect attempts made — request a new code |

------------------------------------------------------------------------

## POST /auth/resend-verification-otp

**Auth:** required · Rate limit: 3 / 15 min per session

No request body. Issues a new OTP (resets the attempt counter to 0) and emails it.

**Success — `200`**: `{ "accepted": true }`

**Errors**

| Status | Code                     | Meaning              |
| ------ | ------------------------- | --------------------- |
| 409    | `EMAIL_ALREADY_VERIFIED`  | nothing to resend     |

------------------------------------------------------------------------

## POST /auth/login

**Auth:** not required · Rate limit: 10 / 15 min per IP+UA

**Request body** (`LoginRequestSchema`): `{ email, password }`.

**Success — `200`**

```json
{
  "user": { "id": "...", "fullName": "...", "email": "...", "emailVerified": true },
  "onboarding": { "status": "...", "nextStep": "..." }
}
```

**Errors**

| Status | Code                  | Meaning                                                        |
| ------ | ---------------------- | ---------------------------------------------------------------- |
| 401    | `INVALID_CREDENTIALS`  | wrong email or password — same code for both, to avoid leaking which one was wrong |

------------------------------------------------------------------------

## POST /auth/logout

**Auth:** required

No request body. Destroys the session and clears the session cookie.

**Success — `200`**: `{ "loggedOut": true }`

------------------------------------------------------------------------

## POST /auth/forgot-password

**Auth:** not required · Rate limit: 5 / 15 min per IP+UA

**Request body** (`ForgotPasswordRequestSchema`): `{ email }`.

**Success — `200`**: always `{ "accepted": true }` — **identical response
whether or not the email exists**, or whether the account even has a
password (OAuth-only accounts silently no-op here) — this is deliberate,
to avoid leaking account existence. Internally, if (and only if) a
password-based account is found, a reset token is generated and emailed.

------------------------------------------------------------------------

## POST /auth/reset-password

**Auth:** not required

**Request body** (`ResetPasswordRequestSchema`): `{ token, password }` —
`token` is the raw value from the emailed reset link (≥32 chars).

On success: sets the new password, invalidates the reset token, and
**destroys every other active session for that user** (a compromised
old password shouldn't stay logged in after a reset).

**Success — `200`**

```json
{ "reset": true, "completedAt": "..." }
```

**Errors**

| Status | Code                          | Meaning                        |
| ------ | ------------------------------ | -------------------------------- |
| 400    | `PASSWORD_RESET_TOKEN_INVALID` | token doesn't match any account  |
| 400    | `PASSWORD_RESET_TOKEN_EXPIRED` | token's 15-minute window has passed |

------------------------------------------------------------------------

## GET /auth/reset-password/validate

**Auth:** not required

**Query:** `?token=...`

A read-only pre-check — lets the frontend confirm a reset link is still
valid *before* showing the "set a new password" form, instead of only
finding out after the user fills it out and submits. Uses the exact same
error codes as `POST /auth/reset-password`, so existing error-handling
logic covers both.

**Success — `200`**: `{ "valid": true }`

**Errors:** same two codes as `POST /auth/reset-password` above (a
malformed/too-short token is also reported as `PASSWORD_RESET_TOKEN_INVALID`).

------------------------------------------------------------------------

## GET /auth/session

**Auth:** not required (this endpoint *is* the auth check)

Returns the current session state — this is what the frontend calls on
load / after any auth action to know who's logged in.

**Success — `200`**

Anonymous: `{ "authenticated": false }`

Authenticated:
```json
{
  "authenticated": true,
  "user": { "id": "...", "fullName": "...", "email": "...", "emailVerified": true },
  "activeWorkspace": { "organizationId": "...", "name": "...", "slug": "...", "teamSize": "SIX_TO_TWENTY" },
  "membership": null,
  "onboarding": { "status": "...", "nextStep": "..." }
}
```

`activeWorkspace` is `null` until a workspace exists. `teamSize` lives
on the organization, not the individual user — it's set once at
workspace creation (`POST /onboarding/workspace`) and shared by every
member, including anyone who joined later via invitation. It's
nullable only for organizations created before this field existed.

A session pointing at a since-deleted account is treated identically to
having no session at all (`{ "authenticated": false }`), not an error.

------------------------------------------------------------------------

## GET /auth/google · GET /auth/google/callback
## GET /auth/github · GET /auth/github/callback

Standard OAuth redirect flow (no PKCE for GitHub, since it doesn't
support it) — not called directly by frontend code, these are full-page browser navigations. `GET /{provider}` redirects to the provider's consent screen; `GET /{provider}/callback` is where the provider redirects back to.

On success, sets the session cookie and redirects to `CLIENT_URL`.
On failure, redirects to `CLIENT_URL/login?error=<code>` instead of
returning JSON (there's no script running to receive a JSON body at that point in the flow) — possible codes: `OAUTH_AUTHENTICATION_FAILED`, `EMAIL_ALREADY_REGISTERED` (the email is already registered under a different provider).
