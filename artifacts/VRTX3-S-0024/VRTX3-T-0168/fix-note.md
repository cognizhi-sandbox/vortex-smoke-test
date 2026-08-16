---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0024
ticket: VRTX3-T-0168
branch: vortex/fix/VRTX3-T-0168-smoke-bugfix-178688102293202-api-healthz-af06ff40
upstream: [artifacts/VRTX3-S-0024/VRTX3-T-0168/PLAN.md]
---

# Fix note — VRTX3-T-0168: `/api/healthz-smoke-bugfix2-107364458` returns 404, should return ok+variant

## Root cause

`routes/api/healthz-smoke-bugfix2-107364458.ts` was never written. Nitro
(`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts`) registers routes by
filename alone with no route table, so a missing file means a missing route — confirmed by a
repo-wide grep for `107364458` returning zero matches before the fix (never-written file, not a
typo'd filename). Planning's RCA in `PLAN.md` is confirmed as-is.

The ticket's stated `404` is a mis-transcription of the actual symptom. Measured live on a dev
server (Vite bound `:5000`): the missing path returned `200 text/html; charset=utf-8` (the SPA
`index.html` shell, 949 bytes) — never a `404` — while the control route
`/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` (33 bytes). The
defect (missing endpoint) is real; the reported status code is not.

## Fix

Added the missing self-contained handler, copied from the `healthz-smoke-528856326-a` probe pair
per `AGENT.md` § Health Probe Routes, with only the variant string changed to `"107364458"`. No
existing file was modified — the probe family is deliberately duplicated per file, not factored
through a shared handler (`ARCHITECTURE.md` § Key Decisions), so the fix is exactly one new handler
file plus its colocated test.

## Regression test

`routes/api/healthz-smoke-bugfix2-107364458.test.ts › returns HTTP 200 with correct response body`
— constructs an `H3Event` for the route and asserts the handler's return value deep-equals
`{ ok: true, variant: "107364458" }`. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-107364458.ts` — new handler, returns `{ ok: true, variant: "107364458" }`.
- `routes/api/healthz-smoke-bugfix2-107364458.test.ts` — new colocated regression test (single body assertion, no timing case).
