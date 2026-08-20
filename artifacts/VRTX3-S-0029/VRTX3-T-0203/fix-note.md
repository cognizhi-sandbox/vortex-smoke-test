---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0029
ticket: VRTX3-T-0203
branch: vortex/fix/VRTX3-T-0203-smoke-bugfix-ha-178724114989195-healthz-16aef118
upstream: [artifacts/VRTX3-S-0029/VRTX3-T-0203/PLAN.md]
downstream: [artifacts/VRTX3-S-0029/qa-test-report.md]
---

# Fix note — VRTX3-T-0203: `/healthz-smoke-bugfix-ha-971401638` returns 404, should return ok+variant

## Root cause

The handler was never written. `routes/api/healthz-smoke-bugfix-ha-971401638.ts` did not exist, and
Nitro registers routes by filename alone (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in
`vite.config.ts`), with no separate route table — no file, no route. A repo-wide grep for
`971401638` returned zero matches, confirming a never-written file rather than a typo'd filename
serving the wrong URL. Confirms Planning's `PLAN.md` RCA without correction.

Two fields of the report itself were wrong, checked live rather than assumed, per `PLAN.md`:
the reported `404` is a mis-transcription — an unmatched `/api/*` path falls through to the SPA
`index.html` shell and answers `200 text/html`, never `404`; and the report drops the `/api/`
prefix, resolved in favour of `routes/api/` since that is the only directory that has ever served a
route in this repo. Neither changes the fix.

## Fix

Added the missing route handler and its colocated test, copied from the pinned template
`routes/api/healthz-smoke-528856326-a{.ts,.test.ts}` with only the variant string changed to
`"971401638"`. This is the minimal fix and the correct layer: every probe in this family is an
independent, self-contained file with no shared code, so the fix is "add the missing file", not a
change to any shared mechanism.

## Regression test

`routes/api/healthz-smoke-bugfix-ha-971401638.test.ts › GET /api/healthz-smoke-bugfix-ha-971401638
› returns HTTP 200 with correct response body` — constructs a real `H3Event` and asserts the
handler's return value deep-equals `{ ok: true, variant: "971401638" }`. Red→green recorded in
`tdd-test-result.md`. A live request against a running dev server (not just this unit test) also
confirmed Nitro actually registered the route — see `tdd-test-result.md` for that evidence, since
the unit test alone imports the module directly and would pass even if the URL were dead.

## Files touched

- `routes/api/healthz-smoke-bugfix-ha-971401638.ts` — new handler, returns
  `{ ok: true, variant: "971401638" }`.
- `routes/api/healthz-smoke-bugfix-ha-971401638.test.ts` — new colocated integration test.

No existing file modified; no dependency added.
