---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0025
ticket: VRTX3-T-0174
branch: vortex/fix/VRTX3-T-0174-smoke-bugfix-17868824506850-api-healthz-14d75606
upstream: [artifacts/VRTX3-S-0025/VRTX3-T-0174/PLAN.md]
downstream: [artifacts/VRTX3-S-0025/qa-test-report.md]
---

# Fix note — VRTX3-T-0174: `/api/healthz-smoke-bugfix2-251329376` returns 404, should return ok+variant

## Root cause

The handler was never written. `routes/api/healthz-smoke-bugfix2-251329376.ts` did not exist, and
Nitro registers routes by filename alone (`nitro({ serverDir: "./" })`, no route table), so the
missing file meant a missing route. Confirmed by `ls routes/api | grep 251329376` (no match) before
the fix. This confirms Planning's `PLAN.md` RCA — no correction needed.

The reported `404` was a mis-transcription, re-confirmed here: before the fix, a live `GET` to the
path returned `200 text/html` (the SPA `index.html` shell) because an unmatched `/api/*` path falls
through to the SPA fallback in both dev and production — never a `404`.

## Fix

Added `routes/api/healthz-smoke-bugfix2-251329376.ts`, copied from the control pair
`routes/api/healthz-smoke-528856326-a.ts` with only the `variant` string changed to
`"251329376"`. Minimal by construction: one new self-contained handler, no shared code, no changes
to any existing file, matching the family's deliberate no-shared-handler architecture.

## Regression test

`routes/api/healthz-smoke-bugfix2-251329376.test.ts › returns HTTP 200 with correct response body`
— constructs a real `H3Event` and asserts the handler's return value deep-equals
`{ ok: true, variant: "251329376" }`. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-251329376.ts` — new handler, returns `{ ok: true, variant: "251329376" }`.
- `routes/api/healthz-smoke-bugfix2-251329376.test.ts` — new colocated regression test (single body assertion, no timing case).
