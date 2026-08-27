---
ticket: VRTX3-T-0318
sprint: VRTX3-S-0047
---

# Summary — VRTX3-T-0318

Added leaf health probe `GET /api/healthz-smoke-436511294-c`, copied from the pinned
`healthz-smoke-528856326-a` pair per `design.md` § D2, with only the variant string changed.

## Files touched

- `routes/api/healthz-smoke-436511294-c.ts` — new handler, `defineHandler` from `nitro/h3` only,
  returns `{ ok: true, variant: "436511294" }`.
- `routes/api/healthz-smoke-436511294-c.test.ts` — new colocated test, one `it` block, asserts the
  returned object, no timing assertion.

No other files touched. No overlap with VRTX3-T-0316 / VRTX3-T-0317.

## AC coverage

- AC-1 (fixed body, 200, `application/json`) — verified against a live `bun run dev` server
  (port `5000`): `200 application/json;charset=UTF-8 {"ok":true,"variant":"436511294"}`.
- AC-2 (byte-identical repeat calls) — same request with a different query string and an added
  header returned an identical body.
- AC-3 (module depends on nothing but the H3 handler factory) — handler's only import is
  `defineHandler` from `nitro/h3`; no event read, no sibling/`db/` reference.
- AC-4 (colocated test) — `routes/api/healthz-smoke-436511294-c.test.ts`, one `it` block asserting
  `toEqual({ ok: true, variant: "436511294" })`.
- AC-5 (compiles into production server) — `bun run build` produced
  `.output/server/_routes/api/healthz_smoke_436511294_c.mjs`; no `.test.` file in the build output.

## Verification commands

- `bun --bun vitest run routes/api/healthz-smoke-436511294-c.test.ts` — red then green (see
  `tdd-test-result.md`).
- `bun run verify` — 153 test files / 213 tests passed, lint and typecheck clean.
- `bun run dev` + `curl` — live route checks (AC-1, AC-2), port read from Vite banner (`5000`).
- `bun run build` — production build output check (AC-5).

No deviations from `PLAN.md`.
