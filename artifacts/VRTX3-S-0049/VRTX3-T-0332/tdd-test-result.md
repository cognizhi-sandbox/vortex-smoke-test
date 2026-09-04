---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0049
ticket: VRTX3-T-0332
branch: vortex/feat/VRTX3-T-0332-password-login-endpoint-with-credential-7e53123a
upstream: [artifacts/VRTX3-S-0049/VRTX3-T-0332/PLAN.md]
---

# TDD result — VRTX3-T-0332

## Test cases

| Test                                                                  | Covers | Intent                                                                                           |
| --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `returns the outcome for valid credentials`                           | AC-1   | seeded email + its password → 200, exact success body                                            |
| `records exactly one successful attempt`                              | AC-2   | empty store → one success login → one row with email, user id, `success`, populated `createdAt`  |
| `rejects a wrong password and records it`                             | AC-3   | wrong password → 401 `Invalid credentials`, one row with `invalid_credentials` and the user id   |
| `rejects an unknown email identically and recorded it without a user` | AC-4   | unknown email → same 401/message, one row with no `userId`                                       |
| `rejects a request with no body and records nothing`                  | AC-5   | no body → 400 `Invalid request`, store stays empty                                               |
| `rejects a request missing the password and records nothing`          | AC-5   | body missing `password` → 400 `Invalid request`, store stays empty                               |
| `carries no password material in the success response`                | AC-6   | success body has no `password`/`passwordHash` key, no `$argon2` value, `user` has exactly 3 keys |

AC-7, AC-8 (POST-only, distinguishable-by-body-not-status) and AC-9/AC-11 (argon2id hash, migration
present) are not unit-testable against a bare `H3Event` — they are verified by the live check and the
migration file below, per PLAN.md step 6. AC-10 (unchanged user listing) is covered by the pre-existing,
untouched `routes/api/users/index.get.test.ts`.

## Red run

`bun --bun vitest run routes/api/auth/login.post.test.ts` (before `routes/api/auth/login.post.ts` existed)

```
FAIL  |server| routes/api/auth/login.post.test.ts [ routes/api/auth/login.post.test.ts ]
Error: Cannot find module './login.post' imported from /workspace/repo/routes/api/auth/login.post.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` (this stack's full gate — `lint && typecheck && test`)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  159 passed (159)
      Tests  225 passed (225)
```

(Baseline per `design.md` § M8 was 158 test files pre-sprint; this ticket adds the one new file,
`routes/api/auth/login.post.test.ts`.)

Live-wiring verification (beyond the gate, per PLAN.md step 6), against `bun --bun run dev` (Vite bound
`:5001` in this container — port read from the banner):

- `POST /api/auth/login` with the seeded email/password → `200 application/json;charset=UTF-8`,
  body `{"ok":true,"outcome":"success","user":{"id":1,"email":"john@example.com","name":"John Doe"}}`.
- `POST /api/auth/login` with a wrong password → `401`, body `message: "Invalid credentials"`.
- `POST /api/auth/login` with an unknown email → identical `401` / `Invalid credentials`.
- `POST /api/auth/login` with no body → `400`, body `message: "Invalid request"`.
- `GET /api/auth/login` → `200 text/html; charset=utf-8` (SPA shell) — no method guard added.
- `POST` to an unrouted `/api/` path (control) → `200 text/html; charset=utf-8`, matching D8: the two
  paths differ by body/`Content-Type`, not status code.
- `GET /api/users` → unchanged: `{"users":[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}]}`,
  no hash field.

TDD-RESULT: 225 passed, 0 failed
