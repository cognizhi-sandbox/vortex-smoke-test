# Design — the identity-user-auth capability

Change id: `vrtx3-i-0059-the-identity-user-auth-capa` · Sprint VRTX3-S-0049 · Idea VRTX3-I-0059

## Measured context

Everything below was read or executed on `vortex/sprint/vrtx3-s-0049-e016db21` at `ce4305c` during
planning. Nothing is carried over from the idea canvas, which is a generated shell: one acceptance
criterion, no design blocks, and empty Current State / Technical Approach / Affected Code sections.

| #   | Finding                                                                                                                                                                                                            | How it was established                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| M1  | No auth exists. `middleware/auth.ts` is 5 lines assigning `event.context.user = { name: "Yeasin" }`. `db/schema.ts` declares one table, `users(id, name, email)`. No login route, no credential, no log.           | read the files                                                                       |
| M2  | `routes/api/users/index.get.ts` returns `db.select().from(users).all()`, and `index.get.test.ts` asserts `toEqual` against exactly two rows of `{id, name, email}`.                                                | read the files                                                                       |
| M3  | `Bun.password` is present and argon2id by default: `hashSync` 73 ms, `verifySync` 46 ms, hashes prefixed `$argon2id$v=`, wrong password verifies `false`. Bun 1.4.0.                                               | ran it in the planning container                                                     |
| M4  | Nested route dirs work, and `.post.ts` genuinely restricts the method. A scratch `routes/api/auth/__scratch.post.ts` answered `POST` with `200 application/json`; `GET` on the same path returned `200 text/html`. | created the scratch route against a live dev server, measured both verbs, removed it |
| M5  | `readBody(event)` works inside the bare-`H3Event` unit-test pattern, both with a JSON body and with no body at all (resolves `undefined`, does not throw).                                                         | wrote a scratch vitest spec, ran the `server` project, exit 0, removed it            |
| M6  | A thrown `createError` surfaces to a direct handler call as `{ status, message }` — `status`, not `statusCode`.                                                                                                    | `routes/api/users/[id].test.ts`                                                      |
| M7  | `/api/auth/login` answers `200 text/html` (the SPA shell) today; control `/api/hello` answers `200 application/json`. Dev server bound `:5000` in this container.                                                  | measured                                                                             |
| M8  | Pre-sprint test-file baseline: **158** files matching `^(src\|routes).*\.test\.(ts\|tsx)$`.                                                                                                                        | `git ls-tree -r --name-only HEAD \| grep -cE ...`                                    |

## Decisions

### D1 — Credentials live in their own table, never as a column on `users`

`user_credentials(user_id PK/FK → users.id, password_hash, updated_at)`.

Adding `password_hash` to `users` would do two bad things at once, both from M2: it would break
`routes/api/users/index.get.test.ts`, and — much worse — `GET /api/users` would begin publishing
password hashes to unauthenticated callers, because that handler selects the whole row. A separate
table means no existing query's shape changes, no existing test is touched, and the hash is only
reachable by a module that explicitly asks for it.

This binds future work beyond this change: any later credential material (a reset token, a TOTP
secret, a recovery code) belongs in a credential-scoped table too, for the same reason. Promoted to
`ARCHITECTURE.md` § Key Decisions.

### D2 — argon2id via `Bun.password`, no new dependency

The stack already requires Bun everywhere — `db/client.ts` imports the `bun:sqlite` builtin, the test
scripts run `bun --bun vitest`, and PM2/systemd set `interpreter: "bun"`. `Bun.password` is therefore
available in dev, test and production alike, and it is argon2id by default (M3). Adding `bcrypt` or
`argon2` from npm would introduce a native build step and a second hashing configuration for no gain.

Use the **async** `Bun.password.verify` in the request path — the handler is already async because of
`readBody`, and a 46 ms synchronous verify would block the event loop. Use `hashSync` in `db/client.ts`,
which is synchronous module-initialisation code; 73 ms once per fresh database is acceptable, and only
the three test modules that import `db/client.ts` pay it under Vitest.

This binds future work: no second password-hashing library enters the repo. Promoted to
`ARCHITECTURE.md` § Key Decisions.

### D3 — "the operation is recorded" means a persisted row, not a log line

The idea's one acceptance criterion is _"Valid credentials: the operation is recorded and its outcome
is returned"_. A `console.log` would satisfy that sentence and be worth nothing: it is not observable
from a test, not queryable, and not machine-checkable under the acceptance-criteria rule. So the
record is a row in `login_attempts(id, email, user_id nullable, outcome, created_at)`, inserted before
the handler responds, on **every** attempt.

`user_id` is nullable because an unknown email has no user to point at, and that case still needs a
record — an attempt log that only captures attempts against existing accounts is the wrong half.

### D4 — Both outcomes are specified, though the canvas names only the success path

The canvas commits to the valid-credentials path alone. Taken literally, a handler that returns
success unconditionally satisfies it. The rejection path is what makes "valid credentials" an
observable property rather than a constant, so this change specifies both, and no more than both:
success and `invalid_credentials`. This is a planning assumption, recorded here rather than assumed
silently.

### D5 — Success is 200; invalid credentials is 401; a malformed request is 400

`routes/api/users/[id].ts` already establishes `createError` as this repository's error idiom, and M6
fixes how a test asserts on it (`{ status, message }`). Conventional status codes beat a 200-with-an-
`outcome`-discriminator here: this is the capability's first written contract, and a login endpoint
that answers 200 on a failed login is a shape nobody should have to inherit.

The attempt row is written **before** the error is thrown, so a rejected login is still recorded. A
malformed request carries no credential to evaluate and is not recorded.

### D6 — An unknown email and a wrong password are indistinguishable to the caller

Both answer 401 with the same body. The two cases differ only in the `user_id` of the row written
server-side. This costs nothing to specify now and would be a breaking change to introduce later.

Constant-time behaviour is explicitly **not** claimed — the unknown-email path skips the argon2 verify
and is therefore measurably faster. Closing that channel is a hardening exercise, listed out of scope
in `proposal.md`.

### D7 — `.post.ts`, and GET is not a 405

M4 settles this: naming the file `login.post.ts` means `POST /api/auth/login` routes and `GET` on the
same path falls through to the SPA shell with `200 text/html`. The spec states that as the observable
behaviour. Do not add a method guard that returns 405 — no route in this repository has one, and
`AGENTS.md` § Gotchas records that as deliberate.

### D8 — Verification asserts body and `Content-Type`, never status code alone

M7: an unrouted `/api/*` path returns `200 text/html`, so `200` alone proves nothing about whether the
route is wired. Every live check in this change compares the response body and `Content-Type` against
a control path.

### D9 — The demo credential is seeded, and is deliberately public

`db/client.ts` already seeds two demo users when `users` is empty (`john@example.com`,
`jane@example.com`). Seeding a credential for `john@example.com` in the same block is what makes the
endpoint exercisable against a running server at integration QA without a registration endpoint,
which is out of scope. The password is a fixed literal in the repository and is a demo fixture in a
boilerplate template that already ships hardcoded users — it is not a secret and must not be
described as one.

## Test harness

No new tooling, no new configuration, no new script. The existing tiers already cover this change:

1. **Route integration tier** — `routes/api/auth/login.post.test.ts`, run by the Vitest `server`
   project (`environment: "node"`, `include: ["routes/**/*.test.ts"]`). Uses the bare-`H3Event`
   pattern from `routes/api/users/index.get.test.ts`, with a POST `Request` carrying a JSON body,
   proven workable in M5. `VITEST=true` makes `db/client.ts` open an in-memory database, so the test
   asserts against real Drizzle inserts and selects without touching `sqlite.db`.
2. **Assertions on the rejection paths** follow M6: `try` / `expect.fail` / `toMatchObject({ status,
message })`, exactly as `routes/api/users/[id].test.ts` does for its 404.
3. **Live check** — one manual pass against a running dev server, comparing `/api/auth/login` to a
   control `/api/*` path on body and `Content-Type` per D8. Read the port from the Vite banner; it was
   `:5000` in the planning container but that is per-container, not per-sprint.
4. **No new E2E spec.** This change ships no UI, so there is no browser-observable flow for Playwright
   to drive. `e2e/smoke.spec.ts` continues to cover the home page and `/api/hello`, both untouched.

Baseline for the close report: 158 test files pre-sprint (M8).

## CI

`.github/workflows/ci.yml` already triggers on pushes and pull requests to `vortex/**`, so the ticket
branch and the sprint branch both get check runs with no workflow edit. This change adds nothing CI
needs to know about: no new dependency to install, no new script to invoke, no service to stand up.
The migration is committed under `drizzle/` and applied by `db/client.ts` at startup, so CI's fresh
checkout builds and tests the same schema a deployment would.

The one CI-visible risk is the generated migration: `bun run db:generate` must be run and its output
committed. An uncommitted migration passes the unit tier locally on a warm database and fails on CI's
fresh one, so the spec makes the committed migration file an explicit requirement rather than a step.
