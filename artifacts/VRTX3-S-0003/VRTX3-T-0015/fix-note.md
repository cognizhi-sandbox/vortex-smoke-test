---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0003
ticket: VRTX3-T-0015
branch: vortex/fix/VRTX3-T-0015-smoke-bugfix-17873270732264355-api-healt-072b9c01
upstream: [artifacts/VRTX3-S-0003/VRTX3-T-0015/PLAN.md]
downstream: [artifacts/VRTX3-S-0003/qa-test-report.md]
---

# Fix note — VRTX3-T-0015: Add the missing `/api/healthz-smoke-bugfix3-267063007` probe

## Root cause

The route handler file for `/api/healthz-smoke-bugfix3-267063007` was never created. Nitro's file-based routing via `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` means that a route exists if and only if its corresponding handler file exists under `routes/`. A repo-wide grep for `267063007` returned zero matches, confirming the file was never written rather than a typo or broken logic.

## Fix

Created two new files:

1. `routes/api/healthz-smoke-bugfix3-267063007.ts` — a handler that returns `{ ok: true, variant: "267063007" }`.
2. `routes/api/healthz-smoke-bugfix3-267063007.test.ts` — a unit test that validates the handler via direct invocation with an H3Event.

The fix is the minimal addition: two standalone files with no changes to existing code, following the established pattern for health probes. No shared helpers, no interdependencies — each probe is self-contained so they can be merged independently.

## Regression test

`routes/api/healthz-smoke-bugfix3-267063007.test.ts` — one `it()` case that creates an H3Event, calls the handler, and asserts the exact response body. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix3-267063007.ts` — new handler returning `{ ok: true, variant: "267063007" }`.
- `routes/api/healthz-smoke-bugfix3-267063007.test.ts` — new test that validates the handler.

## Notes

Copied from `routes/api/healthz-smoke-528856326-a.*` per the documented pattern. The idea canvas (VRTX3-I-0006) named `healthz-smoke-bugfix3-834560860.test.ts` as the template; the pinned pair was substituted because 47 of the 103 probe tests carry a flaky wall-clock assertion that was deliberately dropped in VRTX3-S-0011, and sampling the directory has close to even odds of landing on one of those legacy files.
