---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0049
idea: VRTX3-I-0059
branch: vortex/sprint/vrtx3-s-0049-e016db21
upstream: [artifacts/VRTX3-S-0049/qa-test-report.md]
---

# Release notes — VRTX3-S-0049

## Added

- You can now check an email and password against a stored credential: `POST /api/auth/login` answers with the account's id, email and name when the password is right, and rejects it with `401 Invalid credentials` when it is not. A request that is missing either field is rejected with `400 Invalid request`. (VRTX3-T-0332)
- Every login attempt is now kept in the database — the email tried, the account it matched if any, whether it succeeded, and when — so "did this login succeed, and at what time" is a question you can answer from stored data rather than from log retention. Attempts against an email no account has are recorded too. (VRTX3-T-0332)

## Changed

- A wrong password and an email that belongs to no account now give exactly the same response, so the endpoint cannot be used to find out which addresses have accounts. (VRTX3-T-0332)

## Upgrade notes

- **A database migration runs on first start.** `drizzle/0001_typical_vertigo.sql` adds two tables, `user_credentials` and `login_attempts`. It is applied automatically when the server starts, so a deployment needs no manual step and a fresh checkout with no database file gets both tables. Nothing existing is altered or dropped.
- **No breaking change.** `GET /api/users` and every other endpoint answer exactly as before; passwords are stored in their own table, never on the user record, and no response anywhere includes stored password material.
- **The demo account has a demo password.** The seeded `john@example.com` user gets the credential `password123` so the endpoint can be exercised on a fresh install without a sign-up flow. This is public fixture data in a template that already ships hardcoded demo users — it is not a secret, and it should be removed before this template is used for anything real.
- **Logging in does not keep you logged in.** The endpoint confirms a password and nothing more: it sets no cookie, issues no token, and starts no session, so the next request is anonymous again. Do not treat a successful call as authentication for anything downstream.

## Not included

Per the sprint's declared scope: sessions, tokens and any logged-in state; account sign-up, password change and password reset; roles and permissions; rate limiting and lockout after repeated failures; and any user interface — this release ships no login screen or page. `middleware/auth.ts` remains the placeholder it was, still attaching a fixed user to every request; connecting a proven password to that is tracked as VRTX3-T-0333.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0049/qa-test-report.md` (PASS: all 11 scenarios, no defects found).

## Compliance / Control Evidence

| Control / policy               | Evidence produced                                   | Location                                            | Status    | Exception |
| ------------------------------ | --------------------------------------------------- | --------------------------------------------------- | --------- | --------- |
| Release contents recorded      | this file                                           | `artifacts/VRTX3-S-0049/release-notes.md`           | Satisfied | —         |
| Release verified before land   | QA PASS verdict, 11/11 scenarios                    | `artifacts/VRTX3-S-0049/qa-test-report.md`          | Satisfied | —         |
| Migration communicated         | Upgrade notes name the migration and its two tables | this file, `## Upgrade notes`                       | Satisfied | —         |
| Known limitations communicated | Scope exclusions and the no-session caveat stated   | this file, `## Upgrade notes` and `## Not included` | Satisfied | —         |
