---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0020
ticket: VRTX3-T-0138
branch: vortex/fix/VRTX3-T-0138-smoke-bugfix-178646960271853-api-healthz-c8a963a6
upstream: [artifacts/VRTX3-S-0020/VRTX3-T-0138/PLAN.md]
downstream: [artifacts/VRTX3-S-0020/qa-test-report.md]
---

# Fix note — VRTX3-T-0138: `/api/healthz-smoke-bugfix2-521525844` returns 404, should return ok+variant

## Root cause

The handler file `routes/api/healthz-smoke-bugfix2-521525844.ts` was never written. Nitro 3 resolves
`/api/<name>` purely from the presence of `routes/api/<name>.ts` — there is no registry or manifest
to update, so an unwritten file is a path that was never registered and the request falls through to
the SPA `index.html` catch-all. Confirmed: `grep -rl "521525844" .` (excluding `node_modules`/`.git`)
returned zero matches before the fix, ruling out a typo'd/renamed filename. Planning's RCA in
`PLAN.md` matches this exactly; no correction needed.

**Ticket's reported symptom was wrong, not the defect itself.** Measured against a freshly started
dev server (Vite bound `:5000`) before the fix:

```
GET /api/healthz-smoke-bugfix2-521525844  → 200  text/html; charset=utf-8       (SPA shell, 949 bytes)
GET /api/healthz-smoke-528856326-a        → 200  application/json;charset=UTF-8  {"ok":true,"variant":"528856326"}
```

An unmatched `/api/*` path returns `200 text/html` (the SPA fallback), not `404` — so a 404→200
check would prove nothing here; verification must assert on body + `Content-Type`.

## Fix

Added the single missing handler file, copied verbatim from the `528856326` control pair apart from
the route name and variant string — no shared helper, factory, or import from a sibling probe, per
the family's deliberate independence (`ARCHITECTURE.md` § Key Decisions). This is the minimal fix:
the only defect is a missing file, so the only change is adding it.

## Regression test

`routes/api/healthz-smoke-bugfix2-521525844.test.ts › returns HTTP 200 with correct response body` —
constructs an `H3Event` for the route and asserts the handler resolves to
`{ ok: true, variant: "521525844" }`. Single assertion, no elapsed-time case. Red→green recorded in
`tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-521525844.ts` — new handler, returns `{ ok: true, variant: "521525844" }`.
- `routes/api/healthz-smoke-bugfix2-521525844.test.ts` — new colocated regression test (the fix itself).
