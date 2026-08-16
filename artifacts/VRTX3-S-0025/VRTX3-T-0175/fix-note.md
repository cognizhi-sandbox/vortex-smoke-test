---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0025
ticket: VRTX3-T-0175
branch: vortex/fix/VRTX3-T-0175-smoke-bugfix-17868824506850-api-healthz-d12d3e81
upstream: [artifacts/VRTX3-S-0025/VRTX3-T-0175/PLAN.md]
downstream: [artifacts/VRTX3-S-0025/qa-test-report.md]
---

# Fix note — VRTX3-T-0175: `/api/healthz-smoke-bugfix3-22079551` returns 404

## Root cause

The handler file `routes/api/healthz-smoke-bugfix3-22079551.ts` was never written. Nitro
(`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` in `vite.config.ts`) registers routes by
filename alone, with no route table — the filename is the URL contract. No file, no route. Confirmed
by a repo-wide grep for `22079551` returning zero matches before the fix, ruling out a typo'd
filename serving some other URL. Planning's `PLAN.md` reached the same conclusion; confirmed here
rather than inherited.

The ticket's reported `404` is a mis-transcription: an unmatched `/api/*` path falls through to the
SPA `index.html` shell (`200 text/html`) in both dev and production, not a `404` — the
seventeenth confirmation of this project-wide gotcha (`AGENT.md` § Gotchas).

## Fix

Added the missing handler as a plain copy of the established probe pattern
(`routes/api/healthz-smoke-528856326-a.ts`), changing only the variant string to `"22079551"`. No
existing file was touched — each probe in this family is an intentionally independent, duplicated
handler (no shared factory/constants/barrel export), so the correct layer for this fix is a new
standalone file, matching all 89 siblings.

## Regression test

`routes/api/healthz-smoke-bugfix3-22079551.test.ts › GET /api/healthz-smoke-bugfix3-22079551 ›
returns HTTP 200 with correct response body` — constructs an `H3Event`, invokes the handler directly,
and asserts the body deep-equals `{ ok: true, variant: "22079551" }`. Red→green recorded in
`tdd-test-result.md`.

Additionally verified live (this unit test alone cannot prove Nitro registered the route, since it
imports the handler module directly): on a running dev server (`:5001`, per the Vite banner),
`GET /api/healthz-smoke-bugfix3-22079551` returned `200 application/json;charset=UTF-8` with body
`{"ok":true,"variant":"22079551"}`, alongside the control route `/api/healthz-smoke-528856326-a`
returning `200 application/json` in the same session. The production build
(`bun run build`) emitted the compiled route module at
`.output/server/_routes/api/healthz_smoke_bugfix3_22079551.mjs`.

## Files touched

- `routes/api/healthz-smoke-bugfix3-22079551.ts` — new handler, returns `{ ok: true, variant: "22079551" }`.
- `routes/api/healthz-smoke-bugfix3-22079551.test.ts` — new colocated integration test.
