---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0043
ticket: VRTX3-T-0290
branch: vortex/fix/VRTX3-T-0290-smoke-bugfix-178769906754924-api-healthz-5c7aa195
upstream: [artifacts/VRTX3-S-0043/VRTX3-T-0290/PLAN.md]
downstream: [artifacts/VRTX3-S-0043/qa-test-report.md]
---

# Fix note — VRTX3-T-0290: `/api/healthz-smoke-bugfix2-232336916` returns the SPA shell, not the probe body

## Root cause

`routes/api/healthz-smoke-bugfix2-232336916.ts` was never written. `git log --all -S'232336916'`
returns zero commits, confirming this is a never-written file, not a deleted or renamed one. Nitro
builds its route table by scanning `routes/` at build time; a path with no matching file has no
handler, so the request falls through to the SPA `index.html` shell — `200 text/html`, not the `404`
the ticket reported. Planning's RCA is confirmed as written; nothing to correct.

## Fix

Added the missing handler file, copying the shape of `routes/api/healthz-smoke-528856326-a.ts`
(the pinned copy-source for this probe family) with the variant changed to `"232336916"`. Minimal:
one handler, no shared helper, no changes to routing config — consistent with every other
`healthz-smoke-*` probe.

## Regression test

`routes/api/healthz-smoke-bugfix2-232336916.test.ts › returns HTTP 200 with correct response body`
— builds a real `H3Event` for the route path, calls the handler directly, and asserts the body
deep-equals `{ ok: true, variant: "232336916" }`. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-232336916.ts` (new) — the missing route handler.
- `routes/api/healthz-smoke-bugfix2-232336916.test.ts` (new) — regression test pinning the fix.
