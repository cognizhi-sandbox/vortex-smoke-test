---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0024
ticket: VRTX3-T-0169
branch: vortex/fix/VRTX3-T-0169-smoke-bugfix-178688102293202-api-healthz-7772ee0a
upstream: [artifacts/VRTX3-S-0024/VRTX3-T-0169/PLAN.md]
downstream: [artifacts/VRTX3-S-0024/qa-test-report.md]
---

# Fix note — VRTX3-T-0169: `/api/healthz-smoke-bugfix3-351014898` returns 404

## Root cause

The handler was never written. `routes/api/healthz-smoke-bugfix3-351014898.ts` did not exist, and
Nitro (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts`) registers routes
by filename alone with no route table — no file, no route. A repo-wide grep for `351014898`
returned zero matches before the fix, confirming a never-written file rather than a typo'd filename
serving the wrong URL. This confirms Planning's RCA in `PLAN.md` and the upstream hypothesis in
VRTX3-I-0033.

The ticket's stated `404` is itself a mis-transcription, not a fact about the running server: an
unmatched `/api/*` path falls through to the SPA `index.html` shell and answers `200 text/html`, in
dev and production alike (`AGENT.md` § Gotchas). Measured directly on a live dev server at `:5000`
before the fix:

```
/api/healthz-smoke-bugfix3-351014898   200 text/html; charset=utf-8       (SPA shell)
/api/healthz-smoke-528856326-a         200 application/json;charset=UTF-8 {"ok":true,"variant":"528856326"}
```

## Fix

Added the missing route handler, copied from the `healthz-smoke-528856326-a` probe pair with only
the variant string changed to `"351014898"`. This is the correct layer: every `healthz-smoke-*`
probe is a deliberately independent, self-contained file (no shared handler/factory/constants,
per `ARCHITECTURE.md` § Key Decisions), so the fix is "write the missing file", not a change to any
shared code.

## Regression test

`routes/api/healthz-smoke-bugfix3-351014898.test.ts › GET /api/healthz-smoke-bugfix3-351014898 ›
returns HTTP 200 with correct response body` — constructs a real `H3Event` and asserts the handler's
return value deep-equals `{ ok: true, variant: "351014898" }`. Red→green recorded in
`tdd-test-result.md`. Note (also called out in the ticket and in VRTX3-I-0033 § Regression Risk):
this unit test only proves the handler function is correct — it imports the module directly and
would pass even if Nitro never registered the route. The live-request check below is what proves
the route is actually wired.

## Files touched

- `routes/api/healthz-smoke-bugfix3-351014898.ts` — new: the probe handler, returns
  `{ ok: true, variant: "351014898" }`.
- `routes/api/healthz-smoke-bugfix3-351014898.test.ts` — new: colocated integration test (single
  body assertion, no timing case).

## Notes

Post-fix live verification on the dev server (port `:5000`, read from the Vite banner):

```
target:  200 application/json;charset=UTF-8  {"ok":true,"variant":"351014898"}
control: 200 application/json;charset=UTF-8  {"ok":true,"variant":"528856326"}
```

Both target and control routes returned the expected JSON body in the same session, confirming the
measurement harness itself (not just the target route) was working.
