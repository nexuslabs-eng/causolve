# Personal Settings API

Personal routes apply to the authenticated user. Request and response shapes
are defined in `packages/contracts/src/profile/`, `packages/contracts/src/auth/`,
and `packages/contracts/src/settings/`.

All routes require authentication (`401 UNAUTHENTICATED` otherwise).

---

## PATCH /auth/profile

Updates the authenticated user's name and/or professional role.

**Request body** (`UpdateProfileRequestSchema`):

```json
{
  "fullName": "Samuel Oso",
  "jobRole": "BACKEND_ENGINEER"
}
```

At least one field is required. `jobRole` must use `JobRoleSchema`.

**Success - `200`**: updated `AuthSessionSchema`.

---

## POST /auth/change-password

Changes the authenticated user's password.

**Request body** (`ChangePasswordRequestSchema`):

```json
{
  "currentPassword": "CurrentPassword1!",
  "newPassword": "NewPassword2!"
}
```

The confirmation field is frontend-only. The new password must satisfy
`PasswordSchema`.

**Success - `200`**

```json
{
  "changed": true,
  "changedAt": "2026-11-23T12:00:00.000Z"
}
```

---

## GET /settings/notifications

Returns the authenticated user's notification preferences.

**Success - `200`**

```json
{
  "emailNotifications": true,
  "incidentAlerts": true,
  "investigationUpdates": true,
  "workspaceInvitations": true
}
```

## PATCH /settings/notifications

Updates one or more fields from `NotificationPreferencesSchema`.

```json
{
  "incidentAlerts": false
}
```

At least one field is required. The response is the complete updated object.

---

## GET /settings/preferences

Returns server-backed regional preferences. Theme mode is client-side only
and remains in local storage.

**Success - `200`**

```json
{
  "timeZone": "Africa/Lagos",
  "dateFormat": "DD_MM_YYYY"
}
```

## PATCH /settings/preferences

Replaces the regional preferences using `UpdateUserPreferencesRequestSchema`.

```json
{
  "timeZone": "Africa/Lagos",
  "dateFormat": "DD_MM_YYYY"
}
```

`dateFormat` is `DD_MM_YYYY`, `MM_DD_YYYY`, or `YYYY_MM_DD`.

---

Common errors: `400` validation failure, `401 UNAUTHENTICATED`, and
`409 CURRENT_PASSWORD_INVALID` for an incorrect current password.
