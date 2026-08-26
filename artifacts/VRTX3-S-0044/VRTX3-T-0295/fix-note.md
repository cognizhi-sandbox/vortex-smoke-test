---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0044
ticket: VRTX3-T-0295
branch: vortex/fix/VRTX3-T-0295-smoke-bugfix-178771128043004-api-healthz-a3d31425
upstream: [artifacts/VRTX3-S-0044/VRTX3-T-0295/PLAN.md]
downstream: [artifacts/VRTX3-S-0044/qa-test-report.md]
---

# Fix note — VRTX3-T-0295: `/api/healthz-smoke-bugfix-588991239` returns the SPA shell instead of the probe JSON

## Root cause

`routes/api/healthz-smoke-bugfix-588991239.ts` was never written — `git log --all -S588991239`
returns zero commits, confirmed again on this branch. With no handler registered under that
filename, Nitro's file-based router has nothing to match, and the request falls through to the SPA
catch-all, which answers `200 text/html` (the 949-byte `index.html` shell). This is an omission,
not a regression: there is no prior working version to restore. The ticket's reported `404` is a
mis-transcription of that SPA-shell fallback — confirmed on this branch too (see Regression test).
Planning's `PLAN.md` reaches the same root cause; nothing to correct.

## Fix

Added the single missing handler, copying the pinned `healthz-smoke-528856326-a.ts` shape per
`openspec/changes/vrtx3-s-0044-smoke-bugfix-sprint-smoke-b/design.md` § D5: imports only
`defineHandler` from `nitro/h3`, reads no event property, returns
`{ ok: true, variant: "588991239" }`. Fixed at the route-file layer because that is the entire
contract — Nitro registers routes by filename with no manual wiring, so no other file needed to
change.

## Regression test

`routes/api/healthz-smoke-bugfix-588991239.test.ts › returns HTTP 200 with correct response body` —
constructs an `H3Event` for the probe path, invokes the handler's default export directly, asserts
the result equals `{ ok: true, variant: "588991239" }`. Red→green recorded in `tdd-test-result.md`.
Also confirmed live against a running dev server (port read from the Vite banner): the probe
answers `200 application/json;charset=UTF-8` with the fixed body, byte-identical across two
requests that vary query string, headers and method, while an unrouted sibling path still answers
`200 text/html; charset=utf-8` with the SPA shell — proving the fix is real and that status code
alone could never have shown it.

## Files touched

- `routes/api/healthz-smoke-bugfix-588991239.ts` — new handler, the fix.
- `routes/api/healthz-smoke-bugfix-588991239.test.ts` — new colocated regression test.
