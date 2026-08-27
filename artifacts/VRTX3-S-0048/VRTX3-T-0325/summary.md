---
ticket: VRTX3-T-0325
title: /api/healthz-smoke-956166896-b probe endpoint
---

## What changed

Added leaf health probe `GET /api/healthz-smoke-956166896-b`, copied from the pinned
`healthz-smoke-528856326-a` pair per
`openspec/changes/vrtx3-i-0058-smoke-17878374259820-3-inde/design.md` § D2/D3 — no timing
assertion, single body-equality test.

## Files touched

- `routes/api/healthz-smoke-956166896-b.ts` — new handler, `defineHandler(() => ({ ok: true, variant: "956166896" }))`
- `routes/api/healthz-smoke-956166896-b.test.ts` — new colocated test
- `artifacts/VRTX3-S-0048/VRTX3-T-0325/tdd-test-result.md`, `summary.md` — this ticket's artifacts

## AC coverage

- AC-1 (fixed 200/application-json body) — verified live against `bun run dev` (`:5000`): body
  `{"ok":true,"variant":"956166896"}`, `content-type: application/json;charset=UTF-8`.
- AC-2 (byte-identical repeats) — two requests differing in query string and headers returned
  identical response bytes (diffed).
- AC-3 (module depends on nothing but the handler factory) — only import is `defineHandler` from
  `nitro/h3`; no `event` param read, no sibling import, no `db/` import.
- AC-4 (colocated test asserts the handler's return) — `healthz-smoke-956166896-b.test.ts` builds
  an `H3Event`, invokes the default export, `toEqual({ ok: true, variant: "956166896" })`, one
  `it` block, no timing assertion.
- AC-5 (compiles into production server) — `bun run build` produced
  `.output/server/_routes/api/healthz_smoke_956166896_b.mjs`; no `.test.*` files under `.output/`.

## Verification commands

- `bun run test -- routes/api/healthz-smoke-956166896-b.test.ts` — red before the handler existed,
  green after.
- `bun run verify` (lint + typecheck + full unit tier) — pass, 156 test files / 216 tests.
- `bun run build` — pass; route module present in build output.

## Notes

No overlap with VRTX3-T-0324 / VRTX3-T-0326 — only the two files above were created, nothing else
touched.
