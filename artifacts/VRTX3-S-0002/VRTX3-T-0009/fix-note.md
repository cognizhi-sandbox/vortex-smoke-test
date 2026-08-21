---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0002
ticket: VRTX3-T-0009
branch: vortex/fix/VRTX3-T-0009-smoke-bugfix-17873246012078034-api-healt-4ef9bcab
upstream: [artifacts/VRTX3-S-0002/VRTX3-T-0009/PLAN.md]
downstream: [artifacts/VRTX3-S-0002/qa-test-report.md]
---

# Fix note — VRTX3-T-0009: `/api/healthz-smoke-bugfix3-834560860` returns the SPA shell, not its probe body

> This file replaces stale content from a prior sprint that recycled this ticket key (variant
> `764107669`, committed in `e167bb8`). See `PLAN.md`'s banner.

## Root cause

`routes/api/healthz-smoke-bugfix3-834560860.ts` was never written. Nitro registers `/api/*` routes
by filename alone (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, no route table), so a
missing file means an unmatched path falls through to the SPA `index.html` shell (`200 text/html`),
not a `404`. This confirms `PLAN.md`'s RCA exactly: a missing-file gap, not a regression — no
middleware, routing config, or existing route was touched or misbehaving. A repo-wide grep for
`834560860` returned zero matches before the fix, confirming a never-written file rather than a
typo'd filename.

The ticket's reported `404` is a mis-transcription, as VRTX3-I-0005 itself predicted. Measured live
against `bun run dev` on `:5000` before the fix: the target path returned `200 text/html;
charset=utf-8` (949-byte SPA shell); the control `/api/healthz-smoke-528856326-a` returned `200
application/json;charset=UTF-8` (33-byte probe body).

## Fix

Added the missing handler, copied from the pinned template `routes/api/healthz-smoke-528856326-a.ts`
with only the variant string changed to `"834560860"`. Minimal by construction: one `defineHandler`
from `nitro/h3`, no event parameter, no method guard, no import beyond `nitro/h3`, no shared
handler/factory/constants file. This is the same layer every sibling probe is fixed at — the family's
whole design is that each variant is an independent file.

## Regression test

`routes/api/healthz-smoke-bugfix3-834560860.test.ts › returns HTTP 200 with correct response body`
— constructs a real `H3Event`, imports the handler directly, asserts
`toEqual({ ok: true, variant: "834560860" })`. Red→green recorded in `tdd-test-result.md`.

Also verified live (not part of the automated regression test, since the colocated unit test imports
the handler module directly and would pass even if Nitro never registered the path): `GET
/api/healthz-smoke-bugfix3-834560860` against a running dev server on `:5000` now returns `200
application/json;charset=UTF-8` with body `{"ok":true,"variant":"834560860"}`; the control route
returned `200 application/json;charset=UTF-8` in the same session, confirming the harness was live.
The production build emits `.output/server/_routes/api/healthz_smoke_bugfix3_834560860.mjs`, and no
`*.test.ts` file appears anywhere under `.output/`.

## Files touched

- `routes/api/healthz-smoke-bugfix3-834560860.ts` — new handler, returns `{ ok: true, variant:
"834560860" }`.
- `routes/api/healthz-smoke-bugfix3-834560860.test.ts` — new colocated integration test, single
  body assertion (no wall-clock case, per `AGENT.md` § Health Probe Routes).

No existing file modified or deleted; no new dependency.
