---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0002
ticket: VRTX3-T-0007
branch: vortex/fix/VRTX3-T-0007-smoke-bugfix-17873246012078034-api-healt-2e3923d9
---

# Fix Note — VRTX3-T-0007: `/api/healthz-smoke-bugfix-158202122` missing handler

## Root Cause

`routes/api/healthz-smoke-bugfix-158202122.ts` was never written. Nitro registers routes by filename alone (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts`), with no route table. A missing file means no route; an unmatched `/api/*` path falls through to the SPA shell in both dev and production, answering `200 text/html` instead of the expected `200 application/json` probe body.

This is a missing-file gap, not a regression: nothing was broken by a change, no middleware or route ordering involved. Repo-wide grep for `158202122` returned zero matches, confirming a never-written file rather than a typo'd filename.

## Minimal Fix

Two new files, nothing else:

1. Copy `routes/api/healthz-smoke-528856326-a.ts` to `routes/api/healthz-smoke-bugfix-158202122.ts`, changing variant to `"158202122"`.
2. Copy `routes/api/healthz-smoke-528856326-a.test.ts` to `routes/api/healthz-smoke-bugfix-158202122.test.ts`, updating the import, describe title, request URL, and expected variant. Kept to single body assertion (no timing case).

No shared handler, no factory, no modified files outside `routes/api/`. The probe works in isolation, imports only `nitro/h3`, reads no `event.context`, and stays answerable when auth and database are unavailable.

## Files Touched

- **Created**: `routes/api/healthz-smoke-bugfix-158202122.ts` (8 lines)
- **Created**: `routes/api/healthz-smoke-bugfix-158202122.test.ts` (14 lines)
- **No modifications** to any existing source file.

## Verification

- Unit test (API integration): handler returns `{ ok: true, variant: "158202122" }` ✓
- Live request test (dev server `:5000`):
  - `GET /api/healthz-smoke-bugfix-158202122` → `200 application/json` with correct body ✓
  - Control `/api/healthz-smoke-528856326-a` → `200 application/json` (harness live) ✓
- Full verification gate: lint, typecheck, test — all green ✓
