---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0003
ticket: VRTX3-T-0013
branch: vortex/fix/VRTX3-T-0013-smoke-bugfix-17873270732264355-api-healt-fa5f1ed0
upstream: [artifacts/VRTX3-S-0003/VRTX3-T-0013/PLAN.md]
---

# Fix note — VRTX3-T-0013: Add missing `/api/healthz-smoke-bugfix-858873211` probe

## Root cause

The handler file `routes/api/healthz-smoke-bugfix-858873211.ts` was never written. Nitro registers routes from files in `routes/` — any `/api/*` path with no matching handler file is answered by the SPA `index.html` shell with `200 text/html`, not a real 404. Repo-wide grep for the variant `858873211` returned zero matches, confirming a never-written file.

## Fix

Created two files by copying the pinned template `routes/api/healthz-smoke-528856326-a` pair and substituting the variant string. The handler default-exports a `defineHandler` from `nitro/h3` returning `{ ok: true, variant: "858873211" }` with no external dependencies. The test builds an H3Event, calls the handler directly, and asserts the response body.

## Regression test

`routes/api/healthz-smoke-bugfix-858873211.test.ts › GET /api/healthz-smoke-bugfix-858873211 › returns HTTP 200 with correct response body` — asserts the handler returns the exact response. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-858873211.ts` — new handler, copied from pinned template and variant substituted.
- `routes/api/healthz-smoke-bugfix-858873211.test.ts` — new test, copied from pinned template and variant substituted.

## Notes

Substituted the pinned template pair (`healthz-smoke-528856326-a`) rather than the file named in the idea (`healthz-smoke-bugfix3-834560860`). 47 of the 103 probe tests carry a flaky `expect(elapsed).toBeLessThan(100)` case; the pinned pair is the one guaranteed not to propagate it. See CLAUDE.md § Health Probe Routes for the reasoning.

A live request to `/api/healthz-smoke-bugfix-858873211` on the dev server returns `200 application/json;charset=UTF-8` with the correct body `{"ok":true,"variant":"858873211"}`, replacing the SPA shell.
