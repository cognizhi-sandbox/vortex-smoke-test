---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0045
ticket: VRTX3-T-0301
branch: vortex/fix/VRTX3-T-0301-smoke-bugfix-178771266552323-api-healthz-295b63ea
upstream: [artifacts/VRTX3-S-0045/VRTX3-T-0301/PLAN.md]
downstream: [artifacts/VRTX3-S-0045/qa-test-report.md]
---

# Fix note — VRTX3-T-0301: `/api/healthz-smoke-bugfix-1022589408` returns 404

## Root cause

The handler file `routes/api/healthz-smoke-bugfix-1022589408.ts` was never written. Nitro routes by
filename (`serverDir: "./"` in `vite.config.ts`), so a missing file means the path is simply
unrouted and falls through to the SPA `index.html` shell, answered with `200 text/html` rather than
the fixed JSON body. The ticket's reported `404` is a mis-transcription (measured at planning in
`design.md` and re-confirmed live below) — an unrouted `/api/*` path answers `200`, not `404`, so
status code alone cannot distinguish a working endpoint from a missing one.

## Fix

Added the missing Nitro route handler, copied from the pinned `healthz-smoke-528856326-a` pair per
`AGENTS.md` § Health Probe Routes and `design.md` § D2. The handler imports only `defineHandler`
from `nitro/h3`, reads no property of the event, and returns
`{ ok: true, variant: "1022589408" }`. No existing file was modified.

## Regression test

`routes/api/healthz-smoke-bugfix-1022589408.test.ts` — one `it()` case building an `H3Event` for
the probe path, invoking the handler's default export directly, and asserting the result deep-equals
`{ ok: true, variant: "1022589408" }`. No wall-clock timing assertion. Red→green proof in
`tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix-1022589408.ts` (new) — the route handler.
- `routes/api/healthz-smoke-bugfix-1022589408.test.ts` (new) — the colocated regression test.

## Notes

Live-verified against a running dev server (`:5004` in this container, ports `:5000`-`:5003` were
in use): the new route answers `200 application/json;charset=UTF-8` with the fixed body
`{"ok":true,"variant":"1022589408"}`, an unrelated unrouted `/api/*` path answers `200 text/html`
(SPA shell), and two successive requests to the new route (differing query string and headers)
return byte-identical JSON. Also verified the production build (`bun run build`) emits
`.output/server/_routes/api/healthz_smoke_bugfix_1022589408.mjs` and that `.output/` contains zero
`.test.*` files.
