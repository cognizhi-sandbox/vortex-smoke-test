---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0046
ticket: VRTX3-T-0307
branch: vortex/fix/VRTX3-T-0307-smoke-bugfix-178771464562768-api-healthz-ca5bf72c
upstream: [artifacts/VRTX3-S-0046/VRTX3-T-0307/PLAN.md]
downstream: [artifacts/VRTX3-S-0046/qa-test-report.md]
---

# Fix note — VRTX3-T-0307: `/api/healthz-smoke-bugfix-769466328` returns 404, should return ok+variant

## Root cause

`routes/api/healthz-smoke-bugfix-769466328.ts` never existed. Nitro derives its route table from
the filesystem, so the unmatched `/api/*` path fell through to the SPA `index.html` shell and
answered `200 text/html` in dev, confirmed live on the `:5005` dev server (Vite banner). The
reported `404` in the ticket is a mis-transcription — Planning's `design.md` § D1 measured the same
`200 text/html` result during planning; this is a never-written file, not a broken or moved one.

## Fix

Added the missing route handler, copied verbatim from the pinned `healthz-smoke-528856326-a`
template with only the `variant` string changed to `"769466328"`, per `design.md` § D2/D3. Purely
additive — no existing file was touched, no shared helper introduced.

## Regression test

`routes/api/healthz-smoke-bugfix-769466328.test.ts › GET /api/healthz-smoke-bugfix-769466328 ›
returns HTTP 200 with correct response body` — imports the handler directly and asserts the
returned object equals `{ ok: true, variant: "769466328" }`. Red→green recorded in
`tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-769466328.ts` — new route handler, returns the fixed probe body.
- `routes/api/healthz-smoke-bugfix-769466328.test.ts` — new colocated regression test.
