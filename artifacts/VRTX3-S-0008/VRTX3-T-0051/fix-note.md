# Fix Note — VRTX3-T-0051

## Root cause

`GET /api/healthz-smoke-bugfix3-221117839` did not serve JSON because the handler module
`routes/api/healthz-smoke-bugfix3-221117839.ts` was never written. Nitro (`vite.config.ts`:
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`) derives `/api/<name>` purely from the
filename under `routes/api/`; `ls routes/api/ | grep 221117839` returned nothing before this fix.
Nothing was misconfigured — ~40 sibling endpoints resolve correctly. This was a missing-file
defect, not a broken code path or router bug.

**Note on the reported symptom:** the ticket described this as "returns 404". That was verified
false — on `bun run dev`, the missing path returned `200 text/html` (the SPA `index.html`
fallback), not a `404`. A status-only check (`expect(status).toBe(200)`) would pass identically
before and after the fix, so verification here asserts on the response **body** and
**`Content-Type`**, never on a status-code transition.

## Minimal fix

Added exactly one new handler module, copying the shape of the sibling control
`routes/api/healthz-smoke-bugfix3-605591646.ts`:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "221117839",
  };
});
```

No existing files were touched. No shared helper/constant/factory was introduced with sibling
tickets VRTX3-T-0049 / VRTX3-T-0050 — this endpoint is fully self-contained, no auth, no
database.

## Files touched

- `routes/api/healthz-smoke-bugfix3-221117839.ts` (new) — the handler
- `routes/api/healthz-smoke-bugfix3-221117839.test.ts` (new) — regression test (H3Event
  integration pattern)
- `artifacts/VRTX3-S-0008/VRTX3-T-0051/fix-note.md` (new, this file)
- `artifacts/VRTX3-S-0008/VRTX3-T-0051/tdd-test-result.md` (new)

0 existing files modified. `git diff --stat` against the base branch shows no change to
`vite.config.ts`, `nginx.conf`, or any pre-existing route file.
