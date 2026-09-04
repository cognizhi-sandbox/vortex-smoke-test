---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: VRTX3-S-0049
idea: VRTX3-I-0059
branch: vortex/sprint/vrtx3-s-0049-e016db21
upstream: [artifacts/VRTX3-S-0049/SPRINT-PLAN.md, artifacts/VRTX3-S-0049/VRTX3-T-0332/summary.md]
downstream:
  [
    artifacts/VRTX3-S-0049/integration-test-result.md,
    artifacts/VRTX3-S-0049/integration-defects-resolution.md,
  ]
---

# QA test report — VRTX3-S-0049

## Executive Summary

**Verdict: PASS.** VRTX3-I-0059 (the identity-user-auth capability) is verified on the integrated sprint branch. `POST /api/auth/login` was exercised directly — every one of the 11 scenarios in `openspec/changes/vrtx3-i-0059-the-identity-user-auth-capa/specs/identity-user-auth/spec.md` holds, via the route's unit-integration test suite (7 tests, green) and a live check against a running dev server for the two scenarios that pattern can't reach (method routing, body-vs-status distinguishability). `bun run verify` is green (159 files / 225 tests, up from a 158-file pre-sprint baseline). The existing E2E suite (unaffected by this sprint — the change adds no UI) ran for real and passed 6/6. No defects found; no fix rounds needed.

## E2E Test Status

Ran for real: `bun run test:e2e -- --project=chromium` → `6 passed (3.6s)`, 0 failed, 0 skipped. Full command, per-spec table and the one retried cold-start timeout are in `artifacts/VRTX3-S-0049/integration-test-result.md` (`E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped`). This sprint ships no UI, so no new spec was added or expected — the suite covers the home page and smoke checks, unchanged by this sprint. The login endpoint itself has no browser-observable surface; it is verified below via its unit-integration tests and a live HTTP check.

## Unit Test Results

```
$ bun run verify
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  159 passed (159)
      Tests  225 passed (225)
   Duration  3.95s
```

Pre-sprint baseline was 158 test files (`design.md` M8); this sprint adds exactly one, `routes/api/auth/login.post.test.ts` (7 tests), matching the 159 total above.

`routes/api/auth/login.post.test.ts` (7/7 pass): valid credentials return the outcome; a successful attempt is recorded; a wrong password is rejected and recorded; an unknown email is rejected identically and recorded without a user; a request with no body is rejected and records nothing; a request missing the password is rejected and records nothing; the success response carries no password material.

`routes/api/users/index.get.test.ts` (pre-existing, untouched) still passes, confirming `GET /api/users` is unaffected.

### Scenario verdicts

SCENARIO-VERDICT: Password login / Valid credentials return the outcome — pass
SCENARIO-VERDICT: Password login / A successful attempt is recorded — pass
SCENARIO-VERDICT: Password login / A wrong password is rejected and recorded — pass
SCENARIO-VERDICT: Password login / An unknown email is rejected identically and recorded without a user — pass
SCENARIO-VERDICT: Password login / A malformed request is rejected without being recorded — pass
SCENARIO-VERDICT: Password login / The success response carries no password material — pass
SCENARIO-VERDICT: Password login / Only POST reaches the login handler — pass
SCENARIO-VERDICT: Password login / The route is distinguishable from an unrouted path by body, not status — pass
SCENARIO-VERDICT: Credential storage / A stored credential is an argon2id hash, not the password — pass
SCENARIO-VERDICT: Credential storage / The existing user listing is unchanged — pass
SCENARIO-VERDICT: Credential storage / The schema change is applied by a committed migration — pass

Evidence for the two scenarios not reachable from the bare-`H3Event` unit pattern (method routing, body-vs-status distinguishability) and for the credential-storage scenarios came from a live check against `bun --bun ./node_modules/vite/bin/vite.js --port 5000` (bound `:5001`, port in use) on the built sprint branch:

- `POST /api/auth/login` `{"email":"john@example.com","password":"password123"}` → `200 application/json;charset=UTF-8`, body deep-equal `{"ok":true,"outcome":"success","user":{"id":1,"email":"john@example.com","name":"John Doe"}}`.
- `POST /api/auth/login` wrong password → `401 application/json; charset=utf-8`, `message: "Invalid credentials"`.
- `POST /api/auth/login` unknown email → `401 application/json; charset=utf-8`, `message: "Invalid credentials"` — same status and message as the wrong-password case.
- `POST /api/auth/login` no body, and again missing `password` → both `400 application/json; charset=utf-8`, `message: "Invalid request"`.
- `GET /api/auth/login` → `200 text/html; charset=utf-8` (SPA shell), not the JSON body.
- `POST` to an unrouted `/api/auth/nonexistent` control path → `200 text/html; charset=utf-8` (SPA shell) — same `200` status as the well-formed login call above, but a different body and `Content-Type` (`application/json` vs the SPA shell), confirming the two are distinguishable by body, not by status code.
- Queried `user_credentials` directly (`bun -e` against `sqlite.db`): `password_hash` begins `$argon2id$`, is not `"password123"`, `Bun.password.verify("password123", hash)` → `true`, `Bun.password.verify("nope", hash)` → `false`.
- `login_attempts` after the three non-malformed calls above held exactly 3 rows — `(john@example.com, userId 1, success)`, `(john@example.com, userId 1, invalid_credentials)`, `(nobody@example.com, userId null, invalid_credentials)` — and the two malformed calls added none, confirming AC-5's "MUST NOT record an attempt".
- `GET /api/users` → deep-equal `{"users":[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}]}`, no hash field.
- `drizzle/0001_typical_vertigo.sql` and `drizzle/meta/0001_snapshot.json` are tracked in the repo (`git ls-files`), so a fresh checkout with no `sqlite.db` gets both tables via `db/client.ts`'s startup `migrate()`.

## Code Review

Read `routes/api/auth/login.post.ts`, `db/schema.ts` and `db/client.ts`'s seed block. Implementation matches `design.md` D1–D9: credential in its own table (D1), `Bun.password` argon2id, async `verify` in the request path (D2), the attempt row is written before both the success return and the thrown 401/400 (D3, D5), unknown-email and wrong-password are handled by the same fallthrough branch so they are genuinely indistinguishable server-side except for `userId` (D6), no method guard on `login.post.ts` (D7), no `password`/`passwordHash` field ever leaves the handler (spec's "no stored password material" requirement). No notable concerns observed.

## Coverage Summary

No coverage tool is configured in this repository (`vitest.config.ts` has no `coverage` block, no `check-coverage`/`test-coverage` script is declared) — this section reports test-file/test-count extent, not measured line/branch coverage, per the "no test runner → say so" rule. `routes/api/auth/login.post.ts`'s two branches (success, rejection) and its validation guard are each hit by a dedicated unit test; the two behaviours outside that pattern's reach (GET routing, unrouted-path comparison) are covered by the live checks above instead. Pre-sprint 158 test files → post-sprint 159 (`git ls-tree -r --name-only HEAD | grep -cE '^(src|routes).*\.test\.(ts|tsx)$'`), the one new file being this sprint's.

## Issues Found

None. No entries in `artifacts/VRTX3-S-0049/integration-defects-resolution.md` (`INTEGRATION_DEFECTS_RESOLUTION: COMPLETE`, empty summary table).

## Recommendation

**Proceed — fire `validation.all_acs_passed`.** All 11 spec scenarios pass, `bun run verify` is green, the E2E suite ran for real and passed, and no defects were found.
