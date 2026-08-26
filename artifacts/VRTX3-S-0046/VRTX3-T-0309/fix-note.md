---
name: fix-note
description: Root cause and minimal fix for VRTX3-T-0309
metadata:
  type: fix-note
  ticket: VRTX3-T-0309
---

# Fix note — VRTX3-T-0309

## Root cause

`routes/api/healthz-smoke-bugfix3-238143877.ts` never existed. Nitro builds its route table
from the filesystem, so the path was unregistered and the request fell through to the SPA
`index.html` shell — measured during planning at `200 text/html` (949 bytes), not the `404` the
report claims (the defect is real, the reported status code is not; see
`openspec/changes/vrtx3-s-0046-smoke-bugfix-sprint-smoke-b/design.md` § D1).

## Fix

Added the missing handler, copied verbatim from the pinned `healthz-smoke-528856326-a` template
(design.md § D2) with `variant: "238143877"`, plus its colocated regression test. Purely
additive — no existing file touched.

## Files touched

- `routes/api/healthz-smoke-bugfix3-238143877.ts` (new) — handler, `defineHandler(() => ({ ok: true, variant: "238143877" }))`
- `routes/api/healthz-smoke-bugfix3-238143877.test.ts` (new) — regression test, single body assertion, no timing case
