# VRTX3-T-0093 — Fix note

**Route:** `/api/healthz-smoke-bugfix2-754372119` · **Variant:** `"754372119"`

## Root cause

The handler file was never created. Nitro 3 resolves `/api/<name>` purely from the
presence of `routes/api/<name>.ts` (`serverDir: "./"`, `vite.config.ts:29`) — there is no
route registry to update. Repo-wide grep for `754372119` returned zero matches before the
fix, ruling out a filename typo. Confirmed on a live `bun run dev`: the path returned
`200 text/html; charset=utf-8` (SPA shell fallback), not the reported `404` — the ticket's
stated status code is wrong, but the missing route is real.

## Fix

Added two files, copied verbatim from `routes/api/healthz-smoke-528856326-a.(ts|test.ts)`
apart from the route name and variant string:

- `routes/api/healthz-smoke-bugfix2-754372119.ts` — default-exports `defineHandler` from
  `nitro/h3`, returns `{ ok: true, variant: "754372119" }`. No params, no auth, no `db/`
  import, no method guard, no shared helper.
- `routes/api/healthz-smoke-bugfix2-754372119.test.ts` — constructs an `H3Event`, calls the
  handler, single `toEqual` assertion. No elapsed-time case.

No existing file modified.

## Verification

- Fresh `bun run dev` → `GET /api/healthz-smoke-bugfix2-754372119` → `200
application/json;charset=UTF-8`, body `{"ok":true,"variant":"754372119"}`.
- `bun run verify` (lint + typecheck + test) → all green.
- `bun run build` → emits `.output/server/_routes/api/healthz_smoke_bugfix2_754372119.mjs`;
  no `*.test.ts`-derived module under `.output/server/_routes/`.
