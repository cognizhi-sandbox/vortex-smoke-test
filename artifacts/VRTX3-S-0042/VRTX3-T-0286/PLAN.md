# PLAN — VRTX3-T-0286 · Add GET /api/healthz-smoke-613529736-c

**Change:** `vrtx3-i-0051-smoke-178768361938065-3-independent-endpoints-61`
**Requirement:** Health probe C for variant 613529736

## Objective

Serve `GET /api/healthz-smoke-613529736-c` with a fixed `{ ok: true, variant: "613529736" }` JSON
body, as one new handler file plus one colocated unit test, without touching any file another
ticket owns.

## Steps

1. Read the change's technical-decisions document, §§ D1–D2. It fixes the copy source and explains
   why no wall-clock assertion belongs in the test.
2. Copy `routes/api/healthz-smoke-528856326-a.ts` to `routes/api/healthz-smoke-613529736-c.ts` and
   change the `variant` string to `"613529736"`. Change nothing else — the handler stays a single
   default `defineHandler` from `nitro/h3` taking no parameters.
3. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to
   `routes/api/healthz-smoke-613529736-c.test.ts`, updating the import path, the `describe` title
   and the asserted variant. Keep the single body assertion; add no timing case.
4. Run the project's core gate and confirm the new test is collected by the Vitest `server` project.
5. Verify wiring against a live dev server — read the port from the Vite banner rather than
   assuming `:5000`, and assert on the body and `Content-Type`, not the status code. An unrouted
   `/api/*` path answers `200 text/html`; see the change's technical-decisions document § Context.
6. Verify the production build emits `.output/server/_routes/api/healthz_smoke_613529736_c.mjs`.

## File / module ownership

Creates exactly two files, modifies none:

- `routes/api/healthz-smoke-613529736-c.ts`
- `routes/api/healthz-smoke-613529736-c.test.ts`

Read-only: `routes/api/healthz-smoke-528856326-a.ts` and its `.test.ts` sibling, `vite.config.ts`,
`vitest.config.ts`. The `-a` and `-b` probes belong to VRTX3-T-0284 and VRTX3-T-0285 — do not
create, edit or import them. No dependency edge exists between the three tickets; they may merge in
any order.

## Definition of Done

AC-1 through AC-5 on VRTX3-T-0286 are met, and the diff adds exactly the two files listed above and
modifies zero existing files.
