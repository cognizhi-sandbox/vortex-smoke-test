---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0024
ticket: VRTX3-T-0167
branch: vortex/fix/VRTX3-T-0167-smoke-bugfix-178688102293202-api-healthz-16110d6e
upstream: [artifacts/VRTX3-S-0024/VRTX3-T-0167/PLAN.md]
downstream: [artifacts/VRTX3-S-0024/qa-test-report.md]
---

# Fix note — VRTX3-T-0167: `/api/healthz-smoke-bugfix-27681476` returns 404, should return ok+variant

## Root cause

`routes/api/healthz-smoke-bugfix-27681476.ts` never existed. Nitro registers routes purely by
filename (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts`, no route
table), so a missing file means a missing route — confirmed by a repo-wide grep for `27681476`
returning zero matches, ruling out a typo'd filename. Planning's RCA in `PLAN.md` matches.

The ticket's reported `404` is a mis-transcription. An unmatched `/api/*` path is answered by the
SPA `index.html` shell with `200 text/html`, never `404`, in dev and production alike. Re-measured
live on a running dev server at `:5000`: the target path returned `200 text/html; charset=utf-8`
(949b, the SPA shell) before the fix; the control route `/api/healthz-smoke-528856326-a` returned
`200 application/json;charset=UTF-8` in the same session, proving the harness itself works.

## Fix

Added the missing handler, copied from the `healthz-smoke-528856326-a` probe pair with only the
variant string changed to `"27681476"`. This is the correct layer: every `healthz-smoke-*` probe is
a deliberately independent, self-contained file (no shared handler/factory/constants/barrel — see
`ARCHITECTURE.md` § Key Decisions), so the fix is "write the missing file", not a change to any
shared code.

## Regression test

`routes/api/healthz-smoke-bugfix-27681476.test.ts › returns HTTP 200 with correct response body` —
constructs a real `H3Event` for the route and asserts the handler's return value deep-equals
`{ ok: true, variant: "27681476" }`. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-27681476.ts` — new handler, returns `{ ok: true, variant: "27681476" }`.
- `routes/api/healthz-smoke-bugfix-27681476.test.ts` — new colocated regression test (H3Event integration test).
