# Dev-only tools

Base path: `/dev`. **Only mounted when `NODE_ENV !== "production"`** — the
routes here don't exist at all once deployed, regardless of any other
protection. Not part of the product's real API surface; not defined in
`packages/contracts`.

---

## DELETE /dev/users

Deletes a test account entirely, so you don't need backend help to clean
one up. Deleting the user cascades away their own `Membership` row(s)
automatically. If they were the **sole** member of any organization,
that organization is deleted too, so repeated test signups don't leave
orphaned zero-member organizations behind. Organizations with other
members are left untouched.

**Query:** `?email=...`

**Success — `200`**: `{ "deleted": true }`

**Errors**

| Status | Code              | Meaning                          |
| ------ | ----------------- | -------------------------------- |
| 400    | `INVALID_REQUEST` | malformed/missing email          |
| 404    | `USER_NOT_FOUND`  | no account exists for that email |
