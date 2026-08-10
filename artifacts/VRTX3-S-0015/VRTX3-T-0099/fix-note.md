# VRTX3-T-0099 — Fix note

## Root cause

`routes/api/healthz-smoke-bugfix2-487405332.ts` was never created. Nitro 3 resolves
`/api/<name>` purely from the presence of `routes/api/<name>.ts` — no registry, no import
list — so a never-written file is a never-registered path. Confirmed with a repo-wide grep
for `487405332` before the fix: zero matches, ruling out a filename typo.

The ticket's reported `404` is wrong. Measured live on the dev server: the missing path
returned `200 text/html; charset=utf-8` (the SPA `index.html` fallback), while the control
route `/api/healthz-smoke-bugfix3-404580234` returned `200 application/json;charset=UTF-8`.
This is the same SPA-fallback trap documented in `AGENT.md` § Gotchas — the defect is real,
only its stated status code isn't.

## Fix

Added the missing handler, copied verbatim from `routes/api/healthz-smoke-528856326-a.ts`
(current pair, no flaky timing assertion) with only the variant string and route name
changed:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "487405332",
  };
});
```

No auth, no database, no shared helper/factory/barrel — matches sibling probe conventions
exactly.

## Files touched

- `routes/api/healthz-smoke-bugfix2-487405332.ts` — new handler (create)
- `routes/api/healthz-smoke-bugfix2-487405332.test.ts` — new colocated unit test (create)

Purely additive: 2 new files, 0 existing files modified.
