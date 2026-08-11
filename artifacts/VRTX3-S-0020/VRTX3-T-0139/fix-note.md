---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0020
ticket: VRTX3-T-0139
branch: vortex/fix/VRTX3-T-0139-smoke-bugfix-178646960271853-api-healthz-c5f2ea9a
upstream: [artifacts/VRTX3-S-0020/VRTX3-T-0139/PLAN.md]
downstream: [artifacts/VRTX3-S-0020/qa-test-report.md]
---

# Fix note — VRTX3-T-0139: /api/healthz-smoke-bugfix3-287868165 returns 404

## Root cause

The handler file `routes/api/healthz-smoke-bugfix3-287868165.ts` was never created — a
missing-artifact defect, not a regression or misconfiguration. Nitro 3 resolves `/api/<name>`
purely from the presence of `routes/api/<name>.ts` on disk (no registry or manifest to update), so
a request to this path fell through to the SPA `index.html` catch-all. Confirmed by a repo-wide
grep for `287868165`, which returned zero matches before the fix — ruling out a typo'd/renamed
filename in favor of a file that simply never existed. Planning's RCA in this ticket's `PLAN.md`
is confirmed as-is; no correction needed.

**Reported symptom correction:** the ticket states this path returns `404`. Measured directly
against a live dev server (`bun run dev`, bound to `:5000`) before the fix:

```
GET /api/healthz-smoke-bugfix3-287868165  → 200  text/html; charset=utf-8       949 bytes (SPA shell)
GET /api/healthz-smoke-528856326-a        → 200  application/json;charset=UTF-8  {"ok":true,"variant":"528856326"}  (control)
```

The path already returned 200 (the SPA fallback) — the defect is real, only the stated status code
is wrong.

## Fix

Added `routes/api/healthz-smoke-bugfix3-287868165.ts`, copied verbatim from the sibling
`routes/api/healthz-smoke-528856326-a.ts` apart from the variant string, per the fixed interface
contract in the ticket and `PLAN.md`: a single `defineHandler` from `nitro/h3`, no parameters, no
`event.context` read, no `db/` import, no method guard, no shared helper — each probe is
independently buildable per the family's documented architectural decision. No existing file was
modified.

Re-measured post-fix against a freshly restarted dev server (bound to `:5001`, port `5000` was
still occupied by the pre-fix server process):

```
GET /api/healthz-smoke-bugfix3-287868165  → 200  application/json;charset=UTF-8  {"ok":true,"variant":"287868165"}
GET /api/healthz-smoke-528856326-a        → 200  application/json;charset=UTF-8  {"ok":true,"variant":"528856326"}
```

Production build (`bun run build`) emits `.output/server/_routes/api/healthz_smoke_bugfix3_287868165.mjs`;
no `*.test.ts`-derived module appears under `.output/server/_routes/`.

## Regression test

`routes/api/healthz-smoke-bugfix3-287868165.test.ts › returns HTTP 200 with correct response body`
— constructs an `H3Event` from a `Request` for the route's URL, calls the handler directly, and
asserts the resolved value equals `{ ok: true, variant: "287868165" }`. Single assertion, no
elapsed-time case (per the `528856326` copy source, not an older pre-VRTX3-S-0011 probe test). Red→
green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix3-287868165.ts` — new handler, returns the fixed literal body.
- `routes/api/healthz-smoke-bugfix3-287868165.test.ts` — new regression test pinning the handler's
  return value.
