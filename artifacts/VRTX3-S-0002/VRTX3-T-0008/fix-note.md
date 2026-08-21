---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0002
ticket: VRTX3-T-0008
branch: vortex/fix/VRTX3-T-0008-smoke-bugfix-17873246012078034-api-healt-205c5ea0
upstream: [artifacts/VRTX3-S-0002/VRTX3-T-0008/PLAN.md]
downstream: [artifacts/VRTX3-S-0002/qa-test-report.md]
---

# Fix note — VRTX3-T-0008: `/api/healthz-smoke-bugfix2-142310404` returns 404, should return ok+variant

## Root cause

The handler file `routes/api/healthz-smoke-bugfix2-142310404.ts` was never written. Nitro registers routes from filenames alone — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts` with no route table — so a missing file means an unmatched path. An unmatched `/api/*` path falls through to the SPA shell and answers `200 text/html`, not `404`. The defect is real (the endpoint does not return the expected JSON); its reported status code was a mis-transcription.

## Fix

Created two new files by copying the established probe template (`healthz-smoke-528856326-a`) and changing only the variant string. The handler returns `{ ok: true, variant: "142310404" }`, and the colocated test asserts the handler's return value matches. No shared code, no imports beyond `nitro/h3`, and no timing assertions — the pattern is pure independence.

## Regression test

`routes/api/healthz-smoke-bugfix2-142310404.test.ts` constructs an H3Event and asserts `toEqual({ ok: true, variant: "142310404" })` — the single body assertion that catches the defect. Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-142310404.ts` — new handler, no existing file modified.
- `routes/api/healthz-smoke-bugfix2-142310404.test.ts` — new integration test, no existing file modified.

## Notes

Live verification: `GET /api/healthz-smoke-bugfix2-142310404` against a running dev server returns `200 application/json` with body `{"ok":true,"variant":"142310404"}`. Control route `/api/healthz-smoke-528856326-a` confirms the measurement harness was live. No file outside these two new ones was modified, and no dependency was added.
