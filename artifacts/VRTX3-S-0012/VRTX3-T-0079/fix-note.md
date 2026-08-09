# VRTX3-T-0079 — Fix note

## Root cause

`routes/api/healthz-smoke-bugfix3-196651982.ts` was never created. Nitro 3 resolves
`/api/<name>` purely from the presence of `routes/api/<name>.ts` — no registry or manifest
to update. Repo-wide `grep -rn "196651982"` returned zero matches before the fix, ruling out
a typo under a near-miss filename. The ticket's reported "404" was itself a mis-transcription:
an unmatched `/api/*` path falls through to the SPA `index.html` shell with HTTP 200
`text/html`, not a 404. Verified directly on `bun run dev`:

```
GET /api/healthz-smoke-bugfix3-196651982  → 200 text/html; charset=utf-8   (before fix, SPA shell)
GET /api/healthz-smoke-bugfix3-993514120  → 200 application/json;charset=UTF-8  (control)
```

## Minimal fix

Added the missing handler, copying sibling `routes/api/healthz-smoke-bugfix3-993514120.ts`
verbatim apart from the route name and variant string. No auth, no `db/` import, no method
guard, no shared helper — matches the deliberate duplication pattern for this probe family.

## Files touched

- `routes/api/healthz-smoke-bugfix3-196651982.ts` — new handler, default-exports `defineHandler`
  from `nitro/h3` returning `{ ok: true, variant: "196651982" }`.
- `routes/api/healthz-smoke-bugfix3-196651982.test.ts` — new colocated regression test (real
  `H3Event`, no live server).

## Verification

- `bun --bun vitest run routes/api/healthz-smoke-bugfix3-196651982.test.ts` — RED before the
  handler existed (`Cannot find module`), GREEN after (2/2 passed).
- `bun run verify` (lint + typecheck + full test suite) — all green, 55 files / 113 tests passed.
- Live `bun run dev`: `GET /api/healthz-smoke-bugfix3-196651982` → `200
application/json;charset=UTF-8`, body `{"ok":true,"variant":"196651982"}`.
- `bun run build`: emits `.output/server/_routes/api/healthz_smoke_bugfix3_196651982.mjs`; no
  `*.test.ts`-derived module present under `.output/server/_routes/`.
- Diff is exactly the two new files; no existing file modified.
