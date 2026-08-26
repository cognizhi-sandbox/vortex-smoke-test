---
name: vrtx3-t-0302-fix-note
description: Fix note for missing /api/healthz-smoke-bugfix2-448657707 route handler
metadata:
  ticket: VRTX3-T-0302
  type: fix-note
---

# Fix note — VRTX3-T-0302

## Root cause

`routes/api/healthz-smoke-bugfix2-448657707.ts` never existed. Nitro builds its route table from
the filesystem, so the path was unregistered and any request to it fell through to the SPA
`index.html` shell (`200 text/html`), not the `404` the original report claims. Confirmed via
`ls routes/api/ | grep 448657707` returning nothing, and a live request returning the SPA shell
before the fix.

## Fix

Additive only — created two new files, modified nothing existing:

- `routes/api/healthz-smoke-bugfix2-448657707.ts` — `defineHandler` returning
  `{ ok: true, variant: "448657707" }`, copied verbatim (variant substituted) from the pinned
  `healthz-smoke-528856326-a` template per `design.md` § D2/D3. No method guard, no imports beyond
  `defineHandler` from `nitro/h3`.
- `routes/api/healthz-smoke-bugfix2-448657707.test.ts` — colocated regression test, single body
  assertion, no wall-clock timing case.

## Verification

- Live request (dev server, port 5004 per Vite banner): `GET /api/healthz-smoke-bugfix2-448657707`
  → `200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"448657707"}`.
- Control: `GET /api/healthz-smoke-nonexistent-xyz` → `200 text/html; charset=utf-8` (SPA shell) —
  confirms status code alone cannot distinguish wired vs. missing routes.
- Repeat calls (GET with query string vs. POST with body) returned byte-identical response bodies.
- Production build: `.output/server/_routes/api/healthz_smoke_bugfix2_448657707.mjs` present; no
  `.test.ts` file bundled into `.output/`.

## Files touched

- `routes/api/healthz-smoke-bugfix2-448657707.ts` (new)
- `routes/api/healthz-smoke-bugfix2-448657707.test.ts` (new)
