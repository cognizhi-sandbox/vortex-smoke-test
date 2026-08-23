---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0034
ticket: VRTX3-T-0221
branch: vortex/fix/VRTX3-T-0221-smoke-bugfix-178747715613700-api-healthz-da1c2718
upstream: [artifacts/VRTX3-S-0034/VRTX3-T-0221/PLAN.md]
downstream: [artifacts/VRTX3-S-0034/qa-test-report.md]
---

# Fix note — VRTX3-T-0221: `/api/healthz-smoke-bugfix-839771954` unrouted

## Root cause

The handler file was never written. `routes/api/` had no `healthz-smoke-bugfix-839771954.ts`, and a
repo-wide grep for `839771954` before the fix returned zero source matches. Nitro builds its route
table by scanning the project root (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`,
`vite.config.ts:29`), so with no file the path never reaches a handler and falls through to the SPA
`index.html` shell (`200 text/html`, 949 B), which is why the ticket's reported `404` does not match
what a live request actually returns. Confirms Planning's RCA in `PLAN.md` — no correction needed.

## Fix

Added the missing handler and its colocated unit test, copied from the `healthz-smoke-528856326-a`
pair per `AGENTS.md` § Health Probe Routes (not the `healthz-smoke-bugfix3-993514120` file the
sprint's one idea canvas names — that file carries the flaky `expect(elapsed).toBeLessThan(100)`
case; the current pattern is a single body assertion). No other file changed.

## Regression test

`routes/api/healthz-smoke-bugfix-839771954.test.ts › returns HTTP 200 with correct response body` —
red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-839771954.ts` (new) — handler, returns `{ ok: true, variant: "839771954" }`.
- `routes/api/healthz-smoke-bugfix-839771954.test.ts` (new) — regression test, builds a real `H3Event` and calls the handler directly.
