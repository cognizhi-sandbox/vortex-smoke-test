---
ticket: VRTX3-T-0332
sprint: VRTX3-S-0049
type: summary
---

# Summary — VRTX3-T-0332: password login endpoint with credential storage

Added `POST /api/auth/login`: verifies an email/password pair against an argon2id hash stored in a new
`user_credentials` table (never on `users`), records every attempt — success or `invalid_credentials`
— in a new `login_attempts` table before responding, and returns the outcome. No session, no token, no
UI, `middleware/auth.ts` untouched. Follows `design.md` D1–D9.

## Files touched

- `db/schema.ts` — added `userCredentials` (`userId` PK/FK → `users.id`, `passwordHash`, `updatedAt`)
  and `loginAttempts` (`id`, `email`, nullable `userId`, `outcome`, `createdAt`).
- `db/client.ts` — registered both tables on the drizzle client; extended the existing "seed if empty"
  block to hash and store a credential for the seeded `john@example.com` user (`Bun.password.hashSync`,
  demo fixture per D9).
- `drizzle/0001_typical_vertigo.sql`, `drizzle/meta/0001_snapshot.json`, `drizzle/meta/_journal.json` —
  generated migration for both tables, committed (`bun run db:generate`).
- `routes/api/auth/login.post.ts` — new handler: `readBody` → 400 `Invalid request` if the body isn't
  `{email, password}` as non-empty strings; looks up the user and credential by email; async
  `Bun.password.verify`; writes the attempt row _before_ responding/throwing; 200 success body or 401
  `Invalid credentials` (unknown email and wrong password are indistinguishable, per D6).
- `routes/api/auth/login.post.test.ts` — new route-integration test, bare-`H3Event` + POST `Request`
  pattern from `routes/api/users/index.get.test.ts`; clears `login_attempts` in `beforeEach` since the
  in-memory db is a module-level singleton shared across tests in the file.

## AC coverage

- AC-1/AC-2 (success body, one recorded row) — `returns the outcome for valid credentials`,
  `records exactly one successful attempt`.
- AC-3/AC-4 (wrong password / unknown email, identical 401, correct `userId`) — respective tests.
- AC-5 (malformed request → 400, nothing recorded) — no-body and missing-password tests.
- AC-6 (no password material in response) — `carries no password material in the success response`.
- AC-7/AC-8 (POST-only, no 405; distinguishable by body not status) — live check only (not
  unit-testable against a bare `H3Event`): `GET` and an unrouted control `POST` both answer
  `200 text/html`; the login route answers `application/json`.
- AC-9 (argon2id hash at rest) — verified live: seeded hash begins `$argon2id$`, isn't the plaintext;
  covered indirectly by the success/failure tests verifying against it.
- AC-10 (`GET /api/users` unchanged) — pre-existing `routes/api/users/index.get.test.ts` untouched and
  still green; no hash field in its schema selection.
- AC-11 (committed migration) — `drizzle/0001_typical_vertigo.sql` tracked; `db/client.ts` runs
  `migrate()` at startup, so a fresh checkout with no `sqlite.db` gets both tables.

## Verification commands + results

- `bun --bun vitest run routes/api/auth/login.post.test.ts` — red (module missing), then green
  (7 passed) after adding the handler.
- `bun run verify` (lint + typecheck + full unit tier) — green: 159 test files / 225 tests, 0 failed
  (pre-sprint baseline was 158 files per `design.md` M8).
- `bun --bun run dev` (Vite bound `:5001` in this container) + `curl` — live checks for AC-1, AC-3,
  AC-4, AC-5, AC-7, AC-8, AC-10 (see `tdd-test-result.md` for the full transcript).

No `openspec/` files were created, edited, or deleted. No root docs changed. Touched only the files
listed in the ticket's ownership table.
