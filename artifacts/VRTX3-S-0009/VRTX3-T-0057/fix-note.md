# Fix note — VRTX3-T-0057

## Root cause

Nitro discovers server routes purely from the filesystem (`vite.config.ts:29` —
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`), mapping `routes/api/<name>.ts` →
`/api/<name>`. There is no route table and no manual registration. `grep -rl 993514120 .`
over the repo returned no match — the handler file for this variant was never created, so no
route existed and the request fell through to the SPA `index.html` shell (served as `200
text/html`, not a `404`). Nine other `bugfix3-*` siblings exist and work; this variant was
skipped. There is no bug in existing code — the fix is purely additive.

## Minimal fix

Added the missing handler and its co-located integration test, copied structurally from the
working sibling `routes/api/healthz-smoke-bugfix3-221117839.ts`, changing only the variant
digits.

## Files touched

- `routes/api/healthz-smoke-bugfix3-993514120.ts` — new. Default-exports a `defineHandler`
  (from `"nitro/h3"`) returning `{ ok: true, variant: "993514120" }`.
- `routes/api/healthz-smoke-bugfix3-993514120.test.ts` — new. H3Event integration test
  (regression test), asserting the exact response body and response time.

No existing file was modified. No config, docs, or other routes were touched.

## Verification

- Live dev server: `GET /api/healthz-smoke-bugfix3-993514120` → `200`,
  `Content-Type: application/json;charset=UTF-8`, body `{"ok":true,"variant":"993514120"}`.
- Confirmed discrimination from the SPA fallback: a deliberately nonexistent sibling path
  (`.../healthz-smoke-bugfix3-000000000`) returns `200 text/html; charset=utf-8` (the SPA
  shell) — proving the check used here (status + Content-Type + body) actually distinguishes
  a wired route from a missing one, unlike a status-code-only check.
- Method-agnostic confirmed: `POST` to the new route returns the same `200` JSON body as
  `GET`, consistent with all sibling handlers (no method guard added).
- `bun run verify` (lint + typecheck + full test suite): all green — 49 test files / 104 tests
  passed.
