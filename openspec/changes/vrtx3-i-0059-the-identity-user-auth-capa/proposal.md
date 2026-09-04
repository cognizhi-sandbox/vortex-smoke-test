# The identity-user-auth capability (VRTX3-S-0049)

## Why

`identity-user-auth` has no documented contract, and — measured during planning — it has no
implementation either. What exists is a placeholder: `middleware/auth.ts` assigns
`event.context.user = { name: "Yeasin" }` unconditionally, and `routes/api/hello.ts` reads it. There
is no credential store (`db/schema.ts` holds `users(id, name, email)` and nothing else), no login
route, and no record of any authentication event. `PRODUCT.md` § Not in Scope names this state
explicitly: _"Real authentication (stub middleware exists; swap with real auth before shipping)"_.

So there is nothing here to extract a specification from. This change writes the capability's first
contract and implements the one behaviour the idea commits to: **a password login that verifies a
credential, records the attempt, and returns the outcome.**

`/api/auth/login` returns `200 text/html` today — the SPA shell — because no handler file matches it.
That is the repository's standing fallback behaviour for any unrouted `/api/*` path, not a 404, so
the absence was confirmed against the response body and `Content-Type` rather than the status code.

## What Changes

- **identity-user-auth** (new capability) — two requirements:
  - **Password login** — `POST /api/auth/login` verifies an email/password pair, persists a row
    recording the attempt and its outcome, and returns that outcome to the caller. A wrong password
    and an unknown email are rejected identically.
  - **Credential storage** — password material is stored as an argon2id hash in a table separate
    from `users`, is never returned by any endpoint, and arrives via a committed migration.
- New files: `routes/api/auth/login.post.ts` and its colocated test; one generated migration under
  `drizzle/`.
- Modified files: `db/schema.ts` (two new tables) and `db/client.ts` (seed a credential for the
  existing demo user, so the endpoint is exercisable against a running server).
- `middleware/auth.ts` is **not** touched. Wiring a verified identity into request context is a
  separate concern from proving a credential, and `routes/api/hello.ts` plus its test depend on the
  stub's current behaviour.

Explicitly out of scope:

- Sessions, cookies, JWTs or any token issuance — the endpoint returns an outcome, it does not
  establish a logged-in state.
- Registration, password change/reset, and any endpoint that writes a credential.
- Rate limiting, lockout after repeated failures, CAPTCHA, and constant-time comparison hardening.
- Authorization, roles or permissions.
- Any UI — no login screen, no page, no component. This change ships no front-end file.
- Retro-fitting the `healthz-smoke-*` probe family or any other existing route with auth.

## Impact

- **Affected capability:** `identity-user-auth` only. `health-probes` is untouched — no probe file is
  read, modified or added, and the probe family's independence rule is unaffected.
- **Affected code:** `db/schema.ts`, `db/client.ts`, `drizzle/` (one new migration),
  `routes/api/auth/` (two new files). One ticket owns all of it, so no ownership map overlaps and no
  `depends_on` chain is needed.
- **Affected root docs:** `PRODUCT.md` (the capability map gains a line and the "real authentication
  is out of scope" line is no longer true as written) and `ARCHITECTURE.md` (the entity-level data
  model gains two tables, and two decisions bind future work). `DESIGN.md` is unchanged — the design
  system does not move and this change renders nothing.
- **Risk:** medium, and concentrated in one place. `routes/api/users/index.get.ts` returns
  `db.select().from(users).all()` and its test asserts deep-equality on exactly `{id, name, email}`,
  so putting a hash column on `users` would both break that test and publish password material
  through an unauthenticated endpoint. Keeping credentials in their own table removes the hazard
  rather than working around it — see `design.md` § D1.
- **Verification hazard:** the SPA fallback means a status code cannot distinguish a wired route from
  a missing one. Every check on `/api/auth/login` asserts the response body and `Content-Type`.

## Follow-ups / out of scope

The stub `middleware/auth.ts` still fabricates an identity for every request. That is unchanged and
correct for this change's scope, but it is the obvious next question once a credential can be
proven; it is recorded as a backlog item rather than folded in here.
