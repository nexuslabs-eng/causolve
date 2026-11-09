# Onboarding API

Base path: `/onboarding`. Covers the three-step flow after email
verification: create a workspace, complete a profile, then view a
summary. Request/response shapes are defined in
`packages/contracts/src/onboarding/`.

Every route here requires an authenticated session (`401
UNAUTHENTICATED` otherwise) — none of these are usable before login.

------------------------------------------------------------------------

## POST /onboarding/workspace

Creates an `Organization` and makes the current user its `ADMIN`
(via a `Membership` row), in a single write.

**Request body** (`WorkspaceSetupRequestSchema`)

| Field      | Type   | Notes                                                    |
| ---------- | ------ | ---------------------------------------------------------- |
| `name`     | string | non-empty                                                   |
| `slug`     | string | 3–63 chars, lowercase letters/digits/hyphens, globally unique |
| `teamSize` | enum   | required — describes the organization, not the creating user; shared by every member, including anyone who joins later via invitation |

**Success — `201`**

```json
{ "organizationId": "...", "workspaceName": "...", "workspaceSlug": "...", "nextStep": "PROFILE" }
```

**Errors**

| Status | Code                        | Meaning                                         |
| ------ | ---------------------------- | -------------------------------------------------- |
| 400    | (validation)                  | malformed body                                     |
| 409    | `ONBOARDING_STEP_NOT_ALLOWED` | email not verified yet, or user already has a workspace |
| 409    | `WORKSPACE_SLUG_UNAVAILABLE`  | another organization already has this slug (race-safe — enforced by a DB unique constraint, not just a pre-check) |

------------------------------------------------------------------------

## GET /onboarding/workspace-slug-availability

Live availability check, called as the user types a workspace URL —
purely advisory (doesn't reserve the slug); the real check happens at
creation time.

**Query:** `?slug=...`

**Success — `200`**

```json
{ "slug": "...", "available": true }
```

A slug is reported available if no organization has it, *or* if the
organization that has it belongs to the current user (covers re-checking
your own already-created workspace's URL).

**Errors**

| Status | Code                       | Meaning              |
| ------ | --------------------------- | ----------------------- |
| 422    | `INVALID_WORKSPACE_REQUEST` | malformed slug format |

------------------------------------------------------------------------

## POST /onboarding/profile

**Request body** (`ProfileSetupRequestSchema`)

| Field                   | Type   | Notes                            |
| ------------------------ | ------ | ----------------------------------- |
| `jobRole`                | enum   | required                            |
| `primaryResponsibility`   | enum   | optional                            |

`teamSize` is **not** part of this step — it's captured earlier, at
`POST /onboarding/workspace`, since it describes the organization, not
this one user's profile.

Sets the two profile fields on the user, stamps
`onboardingCompletedAt`, and emails a confirmation
(best-effort — a failed send doesn't fail the request).

**Success — `200`**

```json
{ "completed": true, "onboardingCompletedAt": "...", "nextStep": "COMPLETE" }
```

**Errors**

| Status | Code                        | Meaning                             |
| ------ | ---------------------------- | --------------------------------------- |
| 400    | (validation)                  | malformed body                         |
| 409    | `ONBOARDING_STEP_NOT_ALLOWED` | no workspace created yet               |

------------------------------------------------------------------------

## GET /onboarding/completion

Returns the full summary shown on the "you're all set" screen. Requires
onboarding to be fully finished (workspace + completed profile) — this is
a read of already-completed state, not a step in the flow itself.

**Success — `200`**

```json
{
  "user": { "id": "...", "fullName": "...", "email": "..." },
  "workspace": { "organizationId": "...", "name": "...", "slug": "...", "teamSize": "..." },
  "profile": { "jobRole": "...", "primaryResponsibility": "..." },
  "membership": { "role": "ADMIN" }
}
```

**Errors**

| Status | Code                        | Meaning                                   |
| ------ | ---------------------------- | --------------------------------------------- |
| 409    | `ONBOARDING_STEP_NOT_ALLOWED` | workspace not created, or profile not completed |
