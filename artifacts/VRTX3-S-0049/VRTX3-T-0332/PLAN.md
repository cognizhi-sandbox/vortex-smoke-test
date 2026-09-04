# PLAN — VRTX3-T-0332 · Password login endpoint with credential storage and attempt recording

Change id: `vrtx3-i-0059-the-identity-user-auth-capa` · Capability: `identity-user-auth`
Requirements implemented: **Password login**, **Credential storage**

> Read `openspec/changes/vrtx3-i-0059-the-identity-user-auth-capa/design.md` first. Every step below
> cites a decision in it rather than restating one, and the measured evidence table (M1–M8) there is
> what the steps rest on.

## Objective

Give `identity-user-auth` its first real behaviour: `POST /api/auth/login` verifies an email and
password against a stored argon2id hash, persists exactly one record of the attempt and its outcome,
and returns that outcome. No session, no token, no UI, and no change to the stub identity middleware.

## Steps

1. **Add the two tables to `db/schema.ts`.** `user_credentials` keyed by `user_id` with a foreign key
   to `users.id`, holding `password_hash` and `updated_at`; `login_attempts` holding an id, the
   attempted `email`, a **nullable** `user_id`, `outcome`, and `created_at`. Follow the existing
   `sqliteTable` style already in the file — same import surface, same column helpers. Why a separate
   table rather than a column on `users`: § D1. Why `user_id` is nullable: § D3.

2. **Generate and commit the migration.** Drizzle's generator writes into `drizzle/` and updates
   `drizzle/meta/`. Both must be committed — `db/client.ts` applies pending migrations at startup, so
   an uncommitted migration passes locally against a warm database and fails on a fresh checkout.
   This is the change's one CI-visible risk; see § CI.

3. **Seed a credential for the existing demo user in `db/client.ts`.** Extend the existing
   "seed if empty" block; keep it synchronous by using the sync hashing call rather than restructuring
   the module around a top-level await. Cost is a single hash on a cold database. Rationale and the
   note that this password is a public demo fixture, not a secret: § D9 and § D2.

4. **Write `routes/api/auth/login.post.ts`.** Read the body; reject a malformed one with 400 before
   anything is recorded; look the user up by email; verify with the **async** `Bun.password.verify`;
   insert one attempt row; then return 200 or throw 401. Ordering matters — the row is written before
   the throw, or a rejected login goes unrecorded. Method suffix, status codes and the deliberate
   absence of a 405 guard: § D5 and § D7. Why unknown email and wrong password answer identically:
   § D6.

5. **Write `routes/api/auth/login.post.test.ts`.** Use the bare-`H3Event` pattern from
   `routes/api/users/index.get.test.ts`, with a POST `Request` carrying a JSON body — proven workable
   in § Measured context M5, including the no-body case. Assert thrown errors with the
   `try` / `expect.fail` / `toMatchObject({ status, message })` shape that
   `routes/api/users/[id].test.ts` already uses, noting the property is `status`, not `statusCode`
   (M6). Cover every scenario the two requirements list; the tier and its in-memory database are
   described in § Test harness.

6. **Check the wiring against a running server.** Compare `/api/auth/login` with a control `/api/*`
   path on response body and `Content-Type`, never on status code alone — an unrouted `/api/*` path
   answers `200 text/html` in this repository (§ D8). Read the port from the Vite banner; it is
   per-container, not fixed.

7. **Confirm nothing else moved.** `GET /api/users` must still answer its unchanged two-row body, and
   `routes/api/users/index.get.test.ts` must need no edit — that test is the tripwire § D1 exists to
   protect.

## File/module ownership

| Path                                         | Action                                                      |
| -------------------------------------------- | ----------------------------------------------------------- |
| `db/schema.ts`                               | modify — add the credential table and the attempt table     |
| `db/client.ts`                               | modify — seed one credential inside the existing seed block |
| `drizzle/<generated>.sql`, `drizzle/meta/**` | create — the generated migration, committed                 |
| `routes/api/auth/login.post.ts`              | create                                                      |
| `routes/api/auth/login.post.test.ts`         | create                                                      |

Out of ownership, and to be left exactly as they are: `middleware/auth.ts`, `routes/api/hello.ts`,
`routes/api/users/**`, every `routes/api/healthz-smoke-*` file, all of `src/` and `e2e/`, every
markdown file at the repository root, and all of `openspec/`.

No other ticket exists in this sprint, so no ownership map overlaps and no `depends_on` is set.

## Definition of Done

Ticket acceptance criteria **AC-1 through AC-11** are met, as written on VRTX3-T-0332 — they are
one-for-one with the scenarios in
`openspec/changes/vrtx3-i-0059-the-identity-user-auth-capa/specs/identity-user-auth/spec.md` and are
not retyped here. In outline: AC-1 to AC-8 are the **Password login** requirement (success shape,
success recorded, wrong password, unknown email, malformed request, no password material in the
response, POST-only, distinguishable from an unrouted path); AC-9 to AC-11 are **Credential storage**
(argon2id hash at rest, the user listing unchanged, a committed migration).

Beyond the criteria: the repository's own verification gate is green, and the live check in step 6 has
actually been run rather than reasoned about.

## Design reference

The idea VRTX3-I-0059 carries **no design blocks** — `a2a_get_idea_design` returned an empty block
list, so nothing was exported to `artifacts/VRTX3-S-0049/design/`. This change ships no user-visible
surface, so there is no mockup to match; the contract is the spec's scenarios.
