---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0044
ticket: VRTX3-T-0297
branch: vortex/fix/VRTX3-T-0297-smoke-bugfix-178771128043004-api-healthz-8b500764
upstream: [artifacts/VRTX3-S-0044/VRTX3-T-0297/PLAN.md]
downstream: [artifacts/VRTX3-S-0044/qa-test-report.md]
---

# Fix note — VRTX3-T-0297: `/api/healthz-smoke-bugfix3-1056287485` returns 404

## Root cause

The handler file `routes/api/healthz-smoke-bugfix3-1056287485.ts` was never written —
`git log --all -S1056287485` returns zero commits. This is an omission, not a regression: Nitro
routes by filename (`serverDir: "./"` in `vite.config.ts`), so a missing file means the path is
simply unrouted and falls through to the SPA `index.html` shell, answered with `200 text/html`
rather than the fixed JSON body. The ticket's reported `404` is a mis-transcription (confirmed at
planning in `design.md` and re-confirmed live below) — an unrouted `/api/*` path answers `200`, not
`404`, so status code alone cannot distinguish a working endpoint from a missing one.

## Fix

Added the missing Nitro route handler, copied from the pinned `healthz-smoke-528856326-a` pair per
`AGENTS.md` § Health Probe Routes (the canvas-named templates `healthz-smoke-bugfix3-827939824.ts` /
`healthz-smoke-bugfix3-850084489.test.ts` were not used, per `design.md` § D3). The handler imports
only `defineHandler` from `nitro/h3`, reads no property of the event, and returns
`{ ok: true, variant: "1056287485" }`. No existing file was modified.

## Regression test

`routes/api/healthz-smoke-bugfix3-1056287485.test.ts` — one `it()` case building an `H3Event` for
the probe path, invoking the handler's default export directly, and asserting the result deep-equals
`{ ok: true, variant: "1056287485" }`. Red→green proof in `tdd-test-result.md`.

## Files touched

- `routes/api/healthz-smoke-bugfix3-1056287485.ts` (new) — the route handler.
- `routes/api/healthz-smoke-bugfix3-1056287485.test.ts` (new) — the colocated regression test.

## Notes

Live-verified against a running dev server (`:5002` in this container): the new route answers
`200 application/json` with the fixed body, an unrelated unrouted `/api/*` path answers
`200 text/html` (949-byte SPA shell), and two successive requests to the new route (differing
query string and headers) return byte-identical JSON. Also verified the production build
(`bun run build`) emits `.output/server/_routes/api/healthz_smoke_bugfix3_1056287485.mjs` and that
`.output/` contains zero `.test.*` files.
