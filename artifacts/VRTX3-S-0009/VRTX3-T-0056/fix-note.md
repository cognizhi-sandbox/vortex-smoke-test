# Fix Note — VRTX3-T-0056

## Root cause

Nitro discovers server routes purely from the filesystem (`vite.config.ts:29` —
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`), mapping `routes/api/<name>.ts` →
`/api/<name>`. There is no route table and no manual registration. `grep -rl 192341379 .` over
the repo returned no match — the handler file for `/api/healthz-smoke-bugfix2-192341379` was
never created, so no route was registered and the request fell through to the SPA `index.html`
shell (served as `200 text/html`, not a `404`). There is no bug in existing code; the fix is
purely additive.

Note: the ticket's "Actual: 404" is factually wrong — the missing route actually returns `200
text/html; charset=utf-8` (SPA fallback), not `404`. Verified by direct measurement on `bun run
dev` before and after the fix (see `tdd-test-result.md`).

## Minimal fix

Added the missing handler and its co-located test, copied from the working control
`routes/api/healthz-smoke-bugfix2-901895284.ts` with only the variant digits changed.

## Files touched

- `routes/api/healthz-smoke-bugfix2-192341379.ts` (new) — default-exports a `defineHandler`
  from `"nitro/h3"` returning `{ ok: true, variant: "192341379" }`.
- `routes/api/healthz-smoke-bugfix2-192341379.test.ts` (new) — H3Event integration test
  asserting the exact response body.
- `artifacts/VRTX3-S-0009/VRTX3-T-0056/fix-note.md` (this file)
- `artifacts/VRTX3-S-0009/VRTX3-T-0056/tdd-test-result.md`

No existing route, config, middleware, `db/`, or frontend file was modified.
