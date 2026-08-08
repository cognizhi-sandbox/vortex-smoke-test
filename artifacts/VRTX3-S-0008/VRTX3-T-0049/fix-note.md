# Fix Note — VRTX3-T-0049

## Root cause

`GET /api/healthz-smoke-bugfix-739648350` never served JSON because
`routes/api/healthz-smoke-bugfix-739648350.ts` did not exist. Nitro
(`vite.config.ts`: `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`) derives
`/api/<name>` purely from the filename under `routes/api/`; with no file present, no
route was registered for this path. `ls routes/api/ | grep 739648350` returned nothing
before the fix. ~40 sibling endpoints (79 files) resolve correctly today, so this is a
missing-file defect, not a broken routing/config path.

**The ticket's "returns 404" claim is factually wrong.** An unmatched `/api/*` path is
answered by the SPA `index.html` fallback with `200 text/html`, never `404` — verified
live on `bun run dev` both before and after the fix (see `tdd-test-result.md`). A
status-code-only check would pass identically on the broken build, so verification must
assert on the response body and `Content-Type`.

## Minimal fix

Added exactly the one missing handler module, copying the established sibling pattern
(`routes/api/healthz-smoke-bugfix3-605591646.ts`) with the variant substituted:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "739648350",
  };
});
```

No existing file was touched — no router table, index, config, or shared helper exists
to modify. The handler takes no auth/db dependency and adds no method guard, matching
every sibling.

## Files touched

- `routes/api/healthz-smoke-bugfix-739648350.ts` (new) — the handler.
- `routes/api/healthz-smoke-bugfix-739648350.test.ts` (new) — H3Event integration
  regression test, pins the exact body via `toEqual`.

Purely additive: 2 new files, 0 existing files modified (`git diff --stat` is empty for
tracked files). No overlap with VRTX3-T-0050 / VRTX3-T-0051 — no shared code introduced.
