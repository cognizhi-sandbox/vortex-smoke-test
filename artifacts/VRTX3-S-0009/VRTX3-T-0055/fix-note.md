# Fix Note — VRTX3-T-0055

## Root cause

Nitro discovers server routes purely from the filesystem (`vite.config.ts:29` —
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`), mapping
`routes/api/<name>.ts` → `/api/<name>`. There is no route table and no manual
registration. `routes/api/healthz-smoke-bugfix-755467473.ts` did not exist
(`grep -rl 755467473 .` returned no match), so no route was registered and the
request fell through to the SPA `index.html` shell — a `200 text/html`
response, not a `404`. There is no bug in existing code; the defect is a
missing file, and the fix is purely additive.

## Minimal fix

Added `routes/api/healthz-smoke-bugfix-755467473.ts`, structurally identical
to the control `routes/api/healthz-smoke-bugfix-739648350.ts`, default
exporting a `defineHandler` (from `"nitro/h3"`) that returns
`{ ok: true, variant: "755467473" }`. No method guard, no shared code with any
sibling route, no other file touched.

## Files touched

- `routes/api/healthz-smoke-bugfix-755467473.ts` (new)
- `routes/api/healthz-smoke-bugfix-755467473.test.ts` (new, regression test)
- `artifacts/VRTX3-S-0009/VRTX3-T-0055/fix-note.md` (new, this file)
- `artifacts/VRTX3-S-0009/VRTX3-T-0055/tdd-test-result.md` (new)

## Verification

- Live `bun run dev` check: `GET /api/healthz-smoke-bugfix-755467473` →
  `200 application/json;charset=UTF-8` with body
  `{"ok":true,"variant":"755467473"}`.
- Control check: a deliberately nonexistent sibling path still returns
  `200 text/html; charset=utf-8`, confirming the Content-Type + body check
  discriminates a real route from the SPA fallback (status code alone does
  not).
- `bun run verify` (lint + typecheck + test): all green — 49 test files, 104
  tests passed.
