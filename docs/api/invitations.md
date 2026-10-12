# Invitations API

Shapes are defined in `packages/contracts/src/invitations/`. This resource
splits into two groups of routes with very different access rules.

## Admin-facing routes

Base path: `/organizations/:organizationId/invitations`.

Every route here requires an authenticated session (`401 UNAUTHENTICATED`
otherwise), **and** that the user has a `Membership` in the organization
named by `:organizationId` (`404 ORGANIZATION_NOT_FOUND` otherwise —
deliberately a bare 404, not 403: tenant isolation means never confirming
an organization exists to someone who has no business knowing about it).
Every route in this group additionally requires the `ADMIN` role
(`403 FORBIDDEN` otherwise) — unlike Teams/Services, even *viewing*
invitations is admin-only, since the list exposes other people's email
addresses and who invited whom.

---

### POST /organizations/:organizationId/invitations

**Role required:** `ADMIN`

**Request body** (`CreateInvitationRequestSchema`):

```json
{
  "email": "newhire@acme.com",
  "role": "ENGINEER"
}
```

Generates a random token, emails an invite link to `email`, and creates a
`PENDING` invitation that expires in 7 days.

**Success — `201`**

```json
{
  "invitation": {
    "id": "...",
    "organizationId": "...",
    "email": "newhire@acme.com",
    "role": "ENGINEER",
    "status": "PENDING",
    "invitedBy": { "id": "...", "fullName": "..." },
    "createdAt": "...",
    "expiresAt": "...",
    "acceptedAt": null,
    "revokedAt": null
  }
}
```

**Errors**

| Status | Code                      | Meaning                                                        |
| ------ | ------------------------- | ----------------------------------------------------------------- |
| 400    | (validation)               | malformed body                                                 |
| 409    | `ALREADY_A_MEMBER`          | this email already belongs to a member of this organization    |
| 409    | `INVITATION_ALREADY_PENDING` | a live (unexpired) pending invitation already exists for this email |

---

### GET /organizations/:organizationId/invitations

**Role required:** `ADMIN`

**Query:** `?page=1&limit=10` (`PaginationQuerySchema`).

**Success — `200`**

```json
{
  "invitations": [
    {
      "id": "...",
      "organizationId": "...",
      "email": "...",
      "role": "ENGINEER",
      "status": "PENDING",
      "invitedBy": { "id": "...", "fullName": "..." },
      "createdAt": "...",
      "expiresAt": "...",
      "acceptedAt": null,
      "revokedAt": null
    }
  ],
  "page": 1,
  "limit": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

Note: `status` here is **computed**, not the raw stored value — a row
that's still `PENDING` in the database but whose `expiresAt` has already
passed is reported as `"EXPIRED"`. Nothing flips the stored column
automatically; every read path recomputes this the same way.

**Errors**

| Status | Code              | Meaning                         |
| ------ | ----------------- | -------------------------------- |
| 400    | `INVALID_REQUEST` | malformed pagination parameters |

---

### POST /organizations/:organizationId/invitations/:invitationId/resend

**Role required:** `ADMIN`

Rotates the token (old link stops working), extends `expiresAt` by another
7 days, and re-sends the invite email — reusing the *original* inviter's
name in the email copy, not whoever triggered the resend.

**Success — `200`**: `{ "invitationId": "...", "expiresAt": "..." }`

**Errors**

| Status | Code                    | Meaning                                         |
| ------ | ------------------------ | ------------------------------------------------ |
| 404    | `INVITATION_NOT_FOUND`    | no invitation with this ID exists in this organization |
| 409    | `INVITATION_NOT_PENDING`  | only a pending invitation can be resent (not accepted/revoked) |

---

### POST /organizations/:organizationId/invitations/:invitationId/revoke

**Role required:** `ADMIN`

A status change, not a deletion — the row stays, `status` becomes
`REVOKED`. The token immediately stops working: any further attempt to
preview or accept it reports `status: "REVOKED"`.

**Success — `200`**: `{ "invitationId": "...", "status": "REVOKED", "revokedAt": "..." }`

**Errors**

| Status | Code                   | Meaning                                                |
| ------ | ----------------------- | -------------------------------------------------------- |
| 404    | `INVITATION_NOT_FOUND`   | same meaning as resend                                 |
| 409    | `INVITATION_NOT_PENDING` | only a pending invitation can be revoked                |

---

## Invitee-facing routes (public)

These two intentionally sit outside `/organizations/:organizationId/...`
and skip authentication entirely — the person opening the link has no
session and no organization membership yet.

---

### GET /invitations/preview?token=...

**Auth:** none.

Lets the frontend show the right thing (signup form, "already accepted"
message, etc.) *before* the invitee does anything, by reporting the
invitation's real status up front.

**Success — `200`**

```json
{
  "invitationId": "...",
  "email": "newhire@acme.com",
  "organization": { "id": "...", "name": "...", "slug": "..." },
  "role": "ENGINEER",
  "invitedBy": { "id": "...", "fullName": "..." },
  "expiresAt": "...",
  "status": "PENDING"
}
```

`status` is computed the same way as the admin list endpoint —
`"PENDING"`, `"EXPIRED"`, `"ACCEPTED"`, or `"REVOKED"`.

**Errors**

| Status | Code              | Meaning                                   |
| ------ | ----------------- | ------------------------------------------- |
| 400    | `INVALID_REQUEST` | missing or malformed token                 |
| 404    | `INVITATION_NOT_FOUND` | token doesn't match any invitation     |

---

### POST /invitations/accept

**Auth:** none.

**Request body** (`AcceptInvitationRequestSchema`):

```json
{
  "token": "...",
  "fullName": "New Hire",
  "password": "ResolveOS!123"
}
```

Creates the `User` (already `emailVerified: true` — the invite link itself
is treated as proof of email ownership, so there's no separate OTP step),
creates the `Membership` with the role from the invitation, marks the
invitation `ACCEPTED`, and logs the new user in. `fullName`/`password`
follow the same validation rules as `/auth/signup`.

If the invited email **already has an account**, this is rejected rather
than reused or overwritten — see errors below. There's no "log in to
accept instead" path by design; invitees are expected to be invited at a
work email distinct from any personal account they might already have.

**Success — `201`**

```json
{
  "accepted": true,
  "organizationId": "...",
  "membership": { "role": "ENGINEER" }
}
```

**Errors**

| Status | Code                       | Meaning                                                   |
| ------ | --------------------------- | ------------------------------------------------------------ |
| 400    | (validation)                 | malformed body                                             |
| 404    | `INVITATION_NOT_FOUND`       | token doesn't match any invitation                          |
| 409    | `INVITATION_NOT_PENDING`     | invitation is expired, already accepted, or revoked         |
| 409    | `EMAIL_ALREADY_REGISTERED`   | a `User` already exists for this email                     |
