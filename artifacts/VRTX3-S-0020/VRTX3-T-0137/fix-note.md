---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0020
ticket: VRTX3-T-0137
branch: vortex/fix/VRTX3-T-0137-smoke-bugfix-178646960271853-api-healthz-169bce33
upstream: [artifacts/VRTX3-S-0020/VRTX3-T-0137/PLAN.md]
downstream: [artifacts/VRTX3-S-0020/qa-test-report.md]
---

# Fix note — VRTX3-T-0137: /api/healthz-smoke-bugfix-1060413982 returns 404, should return ok+variant

## Root cause

The handler file `routes/api/healthz-smoke-bugfix-1060413982.ts` was never written. Nitro 3
resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts` — there is no registry or
manifest to update — so a never-written file is a path that was never registered, and the request
falls through to the SPA `index.html` catch-all. Confirmed by a repo-wide grep for `1060413982`
returning zero matches before the fix, ruling out a typo'd/renamed filename. Planning's `PLAN.md`
RCA is confirmed as written; no correction needed.

**The ticket's stated symptom ("404") is wrong; the defect itself is real.** Measured on this branch
against a live dev server before the fix (port `:5000` per the Vite banner):

```
GET /api/healthz-smoke-bugfix-1060413982  → 200  text/html; charset=utf-8        949 bytes (SPA shell)
GET /api/healthz-smoke-528856326-a        → 200  application/json;charset=UTF-8   {"ok":true,"variant":"528856326"}  (control)
```

An unmatched `/api/*` path always returns HTTP 200 via the SPA fallback in this stack — see
`AGENT.md` § Gotchas — so a 404→200 check proves nothing here; verification must be on body and
`Content-Type`.

## Fix

Added the missing handler, copied verbatim from `routes/api/healthz-smoke-528856326-a.ts` (the
current copy-source pointer in `AGENT.md` § Health Probe Routes) with only the variant string
changed to `"1060413982"`. No existing file was modified — this is a missing-artifact defect, so the
correct fix is purely additive at the same layer the sibling probes live at (no shared helper,
factory, or method guard).

## Regression test

`routes/api/healthz-smoke-bugfix-1060413982.test.ts › GET /api/healthz-smoke-bugfix-1060413982 ›
returns HTTP 200 with correct response body` — constructs an `H3Event` for the route's URL, calls
the handler directly, and asserts the resolved value equals `{ ok: true, variant: "1060413982" }`.
Single assertion, no elapsed-time case (per `AGENT.md`'s guidance not to propagate the flaky
`responds in under 100ms` case from pre-VRTX3-S-0011 tests). Red→green recorded in
`tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-1060413982.ts` — new handler, default-exports `defineHandler`
  from `nitro/h3` returning `{ ok: true, variant: "1060413982" }`.
- `routes/api/healthz-smoke-bugfix-1060413982.test.ts` — new colocated integration test (regression
  test for this defect).

## Notes

Post-fix, live verification on a restarted dev server (port `:5001`, `:5000` was still occupied by
the pre-fix server) confirmed `GET /api/healthz-smoke-bugfix-1060413982` returns
`200 application/json;charset=UTF-8` with body exactly `{"ok":true,"variant":"1060413982"}`.
Production build (`bun run build`) emits `.output/server/_routes/api/healthz_smoke_bugfix_1060413982.mjs`
with no `*.test.ts`-derived module under `.output/server/_routes/`. Diff is exactly 2 new files, 0
existing files modified.
