---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0043
ticket: VRTX3-T-0289
branch: vortex/fix/VRTX3-T-0289-smoke-bugfix-178769906754924-api-healthz-d92b964d
upstream: [artifacts/VRTX3-S-0043/VRTX3-T-0289/PLAN.md]
downstream: [artifacts/VRTX3-S-0043/VRTX3-T-0289/tdd-test-result.md]
---

# Fix note — VRTX3-T-0289: Add the missing `/api/healthz-smoke-bugfix-507266122` probe

## Root cause

The route handler file for `/api/healthz-smoke-bugfix-507266122` was never created. Nitro's
file-based routing (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`) means a route exists
if and only if its handler file exists under `routes/`. `ls routes/api/ | grep 507266122` returned
nothing before the fix, confirming the file was never written — not deleted, renamed, or
typo'd. An unmatched `/api/*` path falls through to the SPA `index.html` shell (`200 text/html`),
never `404` — the ticket's reported `404` is a mis-transcription; re-measured live during this run
on `bun run dev` (Vite bound `:5002` after `:5000` and `:5001` were in use):

```
/api/healthz-smoke-bugfix-507266122  ->  200 text/html; charset=utf-8         949 B  (before fix)
/api/healthz-smoke-528856326-a       ->  200 application/json;charset=UTF-8    33 B  (control)
```

## Fix

Created two new files, copied from `routes/api/healthz-smoke-528856326-a.*` with only the variant
string changed to `507266122`:

1. `routes/api/healthz-smoke-bugfix-507266122.ts` — handler returning
   `{ ok: true, variant: "507266122" }`.
2. `routes/api/healthz-smoke-bugfix-507266122.test.ts` — unit test invoking the handler directly
   with a real `H3Event`, carrying the regression header comment.

No existing files were modified. No shared helper, factory, constants file or barrel export was
introduced — duplication across the probe family is deliberate. Did not copy any neighbouring
`bugfix*` test per the PLAN.md instruction — those carry a flaky wall-clock timing case.

## Regression test

`routes/api/healthz-smoke-bugfix-507266122.test.ts` — one `it()` case, no wall-clock assertion.
Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-507266122.ts` — new handler.
- `routes/api/healthz-smoke-bugfix-507266122.test.ts` — new test.
