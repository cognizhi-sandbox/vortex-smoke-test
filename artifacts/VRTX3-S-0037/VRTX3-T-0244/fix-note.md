---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0037
ticket: VRTX3-T-0244
branch: vortex/fix/VRTX3-T-0244-smoke-bugfix-178752663253832-api-healthz-5139d088
upstream: [artifacts/VRTX3-S-0037/VRTX3-T-0244/PLAN.md]
downstream: [artifacts/VRTX3-S-0037/qa-test-report.md]
---

# Fix note — VRTX3-T-0244: `/api/healthz-smoke-bugfix2-386341015` returns 404, should return ok+variant

## Root cause

`routes/api/healthz-smoke-bugfix2-386341015.ts` was never written. Nitro builds its route table
purely by scanning `routes/`, so the path had no handler. Confirms Planning's RCA in `PLAN.md`
without correction.

The ticket's stated `404` is a mis-transcription: an unmatched `/api/*` path falls through to the
SPA `index.html` shell and answers `200 text/html`, never `404` (`AGENTS.md` § Gotchas). Re-measured
live on this run at `:5002`: `/api/healthz-smoke-bugfix2-386341015` returned
`200 text/html; charset=utf-8`, 949 B, before the fix.

## Fix

Added the missing handler, copied from the pinned template `routes/api/healthz-smoke-528856326-a.ts`
per `AGENTS.md` § Health Probe Routes, changing only the `variant` string to `386341015`. No existing
file touched; no shared helper introduced — duplication across the probe family is deliberate
(`ARCHITECTURE.md` § Key Decisions).

## Regression test

`routes/api/healthz-smoke-bugfix2-386341015.test.ts › returns HTTP 200 with correct response body` —
builds a real `H3Event` for the route path, calls the handler directly, asserts
`toEqual({ ok: true, variant: "386341015" })`. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-386341015.ts` — new handler, returns `{ ok: true, variant: "386341015" }`.
- `routes/api/healthz-smoke-bugfix2-386341015.test.ts` — new regression test pinning the response body.
