---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0029
ticket: VRTX3-T-0204
branch: vortex/fix/VRTX3-T-0204-smoke-bugfix-ha-178724114989195-healthz-c9f55157
upstream: [artifacts/VRTX3-S-0029/VRTX3-T-0204/PLAN.md]
downstream: [artifacts/VRTX3-S-0029/qa-test-report.md]
---

# Fix note — VRTX3-T-0204: `/api/healthz-smoke-bugfix-ha2-649579386` returns the SPA shell, not its probe body

## Root cause

`routes/api/healthz-smoke-bugfix-ha2-649579386.ts` was never written. Nitro registers routes by
filename alone (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts:29`, no
route table), so a missing file means a missing route, not a broken one. A repo-wide grep for
`649579386` returned zero matches before this fix, confirming a never-written file rather than a
typo'd filename. Confirms Planning's `PLAN.md` RCA exactly; no correction needed.

The ticket's reported `404` is a mis-transcription: an unmatched `/api/*` path falls through to the
SPA `index.html` shell (`200 text/html; charset=utf-8`, 949B) in both dev and production, never a
`404`. Re-measured live before the fix at `:5001` (see below) rather than taken on the ticket's word.

## Fix

Added the single missing route handler as a self-contained `defineHandler` returning
`{ ok: true, variant: "649579386" }`, following the pinned `528856326` copy-source pair exactly —
no method guard, no `db/` import, no `event.context.user` read, no shared code with the sibling
ticket VRTX3-T-0203.

## Regression test

`routes/api/healthz-smoke-bugfix-ha2-649579386.test.ts › returns HTTP 200 with correct response
body` — constructs a real `H3Event`, calls the handler directly, asserts
`toEqual({ ok: true, variant: "649579386" })`. Red→green recorded in `tdd-test-result.md`.

Live-request verification (proves Nitro actually registered the path, which the unit test alone
cannot):

```
GET /api/healthz-smoke-bugfix-ha2-649579386  → 200 application/json;charset=UTF-8  {"ok":true,"variant":"649579386"}
GET /api/healthz-smoke-528856326-a (control) → 200 application/json;charset=UTF-8  {"ok":true,"variant":"528856326"}
```

## Files touched

- `routes/api/healthz-smoke-bugfix-ha2-649579386.ts` — new route handler.
- `routes/api/healthz-smoke-bugfix-ha2-649579386.test.ts` — new colocated integration test.
