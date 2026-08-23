---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0034
ticket: VRTX3-T-0222
branch: vortex/fix/VRTX3-T-0222-smoke-bugfix-178747715613700-api-healthz-53c7b13c
upstream: [artifacts/VRTX3-S-0034/VRTX3-T-0222/PLAN.md]
downstream: [artifacts/VRTX3-S-0034/qa-test-report.md]
---

# Fix note — VRTX3-T-0222: `/api/healthz-smoke-bugfix2-554747562` returns 404, should return ok+variant

## Root cause

`routes/api/healthz-smoke-bugfix2-554747562.ts` was never written. A repo-wide grep for
`554747562` returned zero matches before the fix. Nitro builds its route table from files under
`routes/api/` (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, `vite.config.ts:29`), so a
path with no file never reaches a handler and falls through to the SPA `index.html` shell with
`200 text/html; charset=utf-8`. The ticket's reported `404` is a mis-transcription — confirmed the
same live before the fix: `curl` returned `200 text/html`, not `404`. Planning's `PLAN.md` RCA is
correct; confirmed rather than corrected here.

## Fix

Added the missing handler file, copying the shape of `routes/api/healthz-smoke-528856326-a.ts`
(the pinned template per `AGENTS.md` § Health Probe Routes) and changing only the variant string
to `"554747562"`. No existing file was touched — the fix is additive by construction, matching
every other `healthz-smoke-*` probe in the family.

## Regression test

`routes/api/healthz-smoke-bugfix2-554747562.test.ts › returns HTTP 200 with correct response
body` — builds a real `H3Event` for the route path, calls the handler directly, and asserts the
body equals `{ ok: true, variant: "554747562" }`. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-554747562.ts` (new) — the handler, returns `{ ok: true, variant: "554747562" }`.
- `routes/api/healthz-smoke-bugfix2-554747562.test.ts` (new) — the regression test.

## Notes

Per `AGENTS.md` § Health Probe Routes, the sprint's one idea canvas (VRTX3-I-0041) names
`healthz-smoke-bugfix3-993514120` as a template, which is not this ticket's route and whose test
carries the flaky `expect(elapsed).toBeLessThan(100)` case. Copied `528856326` instead — the
single-body-assertion pattern, no timing case.
