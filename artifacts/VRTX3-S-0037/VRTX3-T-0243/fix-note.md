---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0037
ticket: VRTX3-T-0243
branch: vortex/fix/VRTX3-T-0243-smoke-bugfix-178752663253832-api-healthz-742b8e13
upstream: [artifacts/VRTX3-S-0037/VRTX3-T-0243/PLAN.md]
downstream: [artifacts/VRTX3-S-0037/VRTX3-T-0243/tdd-test-result.md]
---

# Fix note — VRTX3-T-0243: Add the missing `/api/healthz-smoke-bugfix-147016547` probe

## Root cause

The route handler file for `/api/healthz-smoke-bugfix-147016547` was never created. Nitro's
file-based routing (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`) means a route exists
if and only if its handler file exists under `routes/`. A repo-wide grep for `147016547` returned
zero matches, confirming the file was never written. An unmatched `/api/*` path falls through to
the SPA `index.html` shell (`200 text/html`), never `404` — the ticket's reported `404` is a
mis-transcription; re-measured live during this run on `bun run dev` (Vite bound `:5002`):

```
/api/healthz-smoke-bugfix-147016547  ->  200 text/html; charset=utf-8   949 B
/api/healthz-smoke-528856326-a       ->  200 application/json;charset=UTF-8  33 B
```

## Fix

Created two new files, copied from `routes/api/healthz-smoke-528856326-a.*` with only the variant
string changed to `147016547`:

1. `routes/api/healthz-smoke-bugfix-147016547.ts` — handler returning
   `{ ok: true, variant: "147016547" }`.
2. `routes/api/healthz-smoke-bugfix-147016547.test.ts` — unit test invoking the handler directly
   with a real `H3Event`.

No existing files were modified. No shared helper, factory, constants file or barrel export was
introduced — duplication across the probe family is deliberate.

## Regression test

`routes/api/healthz-smoke-bugfix-147016547.test.ts` — one `it()` case, no wall-clock assertion.
Red→green recorded in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-147016547.ts` — new handler.
- `routes/api/healthz-smoke-bugfix-147016547.test.ts` — new test.
