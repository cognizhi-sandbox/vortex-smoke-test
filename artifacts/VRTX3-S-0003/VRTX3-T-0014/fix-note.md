---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0003
ticket: VRTX3-T-0014
branch: vortex/fix/VRTX3-T-0014-smoke-bugfix-17873270732264355-api-healt-4223d7ce
upstream: [artifacts/VRTX3-S-0003/VRTX3-T-0014/PLAN.md]
downstream: [artifacts/VRTX3-S-0003/qa-test-report.md]
---

# Fix note — VRTX3-T-0014: `/api/healthz-smoke-bugfix2-664793322` returns 404, should return ok+variant

> This file replaces a stale record from an earlier sprint that reused this ticket key and reported
> a completed fix for a different endpoint (`/api/healthz-smoke-bugfix2-59156521`). That record is
> not this ticket's; this is the current, correct one.

## Root cause

The handler file for `/api/healthz-smoke-bugfix2-664793322` was never written. API paths in this
project come purely from the file tree under `routes/` (`nitro({ serverDir: "./", ignore:
["**/*.test.ts"] })` in `vite.config.ts`), so with no file present the path is unrouted. A
repo-wide grep for `664793322` returned zero matches before this fix, confirming a never-written
route rather than a typo'd filename. This confirms `PLAN.md`'s RCA exactly; no correction needed.

The ticket's reported `404` is itself a mis-transcription: an unmatched `/api/*` path falls through
to the SPA `index.html` shell and answers `200 text/html; charset=utf-8` (949 bytes), not `404`.
Re-measured live before the fix: the path returned `200 text/html`, while the control
`/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` with its variant
body. The underlying defect (missing route) is real; the status code in the report is not.

## Fix

Added `routes/api/healthz-smoke-bugfix2-664793322.ts`, a `defineHandler` (from `nitro/h3`) that
takes no parameters and returns the literal `{ ok: true, variant: "664793322" }`. Copied from
`routes/api/healthz-smoke-528856326-a.ts` with only the variant string changed — no shared helper,
no import beyond `nitro/h3`, no method guard, consistent with every sibling probe. This is a purely
additive fix at the only correct layer: a new route file, since the project's convention treats
each probe as an independent, self-contained handler (`ARCHITECTURE.md` § Key Decisions).

## Regression test

`routes/api/healthz-smoke-bugfix2-664793322.test.ts › returns HTTP 200 with correct response body`
— builds a real `H3Event` for the route, calls the handler directly, and asserts the response body
deep-equals `{ ok: true, variant: "664793322" }`. One `it()` case, no wall-clock assertion (copied
from the pinned `528856326` pair, not from the idea-named `healthz-smoke-bugfix3-834560860.test.ts`
— see Notes). Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-664793322.ts` — new handler (added).
- `routes/api/healthz-smoke-bugfix2-664793322.test.ts` — new regression test (added).

## Notes

VRTX3-I-0006 named `routes/api/healthz-smoke-bugfix3-834560860.test.ts` as the test template.
Substituted the pinned `routes/api/healthz-smoke-528856326-a.test.ts` pair instead, per
`AGENT.md` § Health Probe Routes: 47 of the 106 probe tests carry a flaky
`expect(elapsed).toBeLessThan(100)` case, and the pinned pair is guaranteed not to. Diffing the two
confirms both are shape-identical (single body assertion, no timing case) — the substitution cost
nothing this time, consistent with prior recorded near-misses.
