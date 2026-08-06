# Fix Note — VRTX3-T-0045

## Root cause

`routes/api/healthz-smoke-bugfix3-605591646.ts` was never written. Nitro builds its API router
from `routes/api/**` (confirmed `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in
`vite.config.ts:29`), so with no handler module for this path, an unmatched `/api/*` request
falls through to the SPA `index.html` fallback — answered `200 text/html` (SPA shell), never a 404. The sibling `routes/api/healthz-smoke-bugfix3-764107669.ts` exists and correctly answers
`{"ok":true,"variant":"764107669"}`, confirming the routing mechanism itself is sound; the only
gap was the missing file.

## Fix

Minimal, additive-only change: added the missing handler module, mirroring the sibling
endpoint's shape exactly (`defineHandler` from `nitro/h3`, default export, literal return):

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "605591646",
  };
});
```

## Files touched

- `routes/api/healthz-smoke-bugfix3-605591646.ts` — new handler (the fix)
- `routes/api/healthz-smoke-bugfix3-605591646.test.ts` — new regression test (H3Event
  integration test, asserts on response body, not status code)

No existing file modified. No shared helper/constant introduced — independent of
VRTX3-T-0043 and VRTX3-T-0044 per the sprint plan's no-coupling contract.
