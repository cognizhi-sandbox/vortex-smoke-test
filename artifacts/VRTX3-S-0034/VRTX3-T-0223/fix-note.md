---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0034
ticket: VRTX3-T-0223
branch: vortex/fix/VRTX3-T-0223-smoke-bugfix-178747715613700-api-healthz-29c97545
upstream: [artifacts/VRTX3-S-0034/VRTX3-T-0223/PLAN.md]
downstream: [artifacts/VRTX3-S-0034/qa-test-report.md]
---

# Fix note — VRTX3-T-0223: `/api/healthz-smoke-bugfix3-238311955` returns 404

## Root cause

`routes/api/healthz-smoke-bugfix3-238311955.ts` was never written. A repo-wide grep for
`238311955` returned zero matches before this fix. Nitro builds its route table by scanning
the project root (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, `vite.config.ts:29`),
so with no file present the path never reaches a handler and falls through to the SPA
`index.html` shell, which answers `200 text/html`. The ticket's reported `404` is a
mis-transcription — confirmed live: `GET /api/healthz-smoke-bugfix3-238311955` on a running dev
server (`:5000`) returned `200 text/html; charset=utf-8`, 949 B, before the fix.

## Fix

Added the missing handler and its test, copying the pinned `routes/api/healthz-smoke-528856326-a`
pair per `AGENTS.md` § Health Probe Routes (not the canvas's named copy source, which carries a
flaky `expect(elapsed).toBeLessThan(100)` case). Changed only the `variant` literal to
`"238311955"`. No shared helper, factory, or existing file was touched — duplication across probe
routes is deliberate (`ARCHITECTURE.md` § Key Decisions).

## Regression test

`routes/api/healthz-smoke-bugfix3-238311955.test.ts › returns HTTP 200 with correct response body`
— builds a real `H3Event` for the path, calls the handler directly, asserts the exact body. Red→
green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix3-238311955.ts` (new) — handler returning
  `{ ok: true, variant: "238311955" }`.
- `routes/api/healthz-smoke-bugfix3-238311955.test.ts` (new) — regression test pinning the body.
