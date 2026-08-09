# VRTX3-T-0077 — Fix note

## Root cause

`routes/api/healthz-smoke-bugfix-6202295.ts` was never created. Nitro 3 resolves `/api/<name>`
purely from the presence of `routes/api/<name>.ts` — no registry/manifest to update — so the
missing file meant the path was never registered. Repo-wide grep for `6202295` returned zero
matches before the fix, ruling out a filename typo.

**Reported symptom "404" was wrong.** Measured on live `bun run dev`: the missing route returned
`200 text/html; charset=utf-8` (SPA `index.html` fallback), not 404. Control route
`/api/healthz-smoke-bugfix3-993514120` returned `200 application/json;charset=UTF-8` with the
correct body. Verified against response body + `Content-Type`, not status code, per
`AGENT.md` § Gotchas.

## Minimal fix

Added two new files, mirroring `routes/api/healthz-smoke-bugfix3-993514120.ts` and its colocated
test verbatim apart from the route name and variant string. No existing file modified, no shared
helper/factory/constants introduced (deliberate duplication per `ARCHITECTURE.md` § Key
Decisions).

## Files touched

- `routes/api/healthz-smoke-bugfix-6202295.ts` (new) — `defineHandler` from `nitro/h3`, returns
  `{ ok: true, variant: "6202295" }`.
- `routes/api/healthz-smoke-bugfix-6202295.test.ts` (new) — regression test; H3Event integration
  test asserting response body and sub-100ms resolution.

## Verification

- Live `curl` after fix: `200 application/json;charset=UTF-8` / `{"ok":true,"variant":"6202295"}`.
- `bun run verify` (lint + typecheck + test): all green — 55 test files / 113 tests passed, 0
  failures.
- `bun run build`: emitted `.output/server/_routes/api/healthz_smoke_bugfix_6202295.mjs`; no
  `*.test.ts`-derived module present under `.output/server/_routes/`.
