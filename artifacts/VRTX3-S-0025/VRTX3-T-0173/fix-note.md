---
artifact: fix-note
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0025
ticket: VRTX3-T-0173
branch: vortex/fix/VRTX3-T-0173-smoke-bugfix-17868824506850-api-healthz-9945d1ab
upstream: [artifacts/VRTX3-S-0025/VRTX3-T-0173/PLAN.md]
downstream: [artifacts/VRTX3-S-0025/qa-test-report.md]
---

# Fix note — VRTX3-T-0173: `/api/healthz-smoke-bugfix-134576216` returns 404, should return ok+variant

## Root cause

`routes/api/healthz-smoke-bugfix-134576216.ts` was never written. Nitro registers routes by
filename alone (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, no route table) — a missing
file is a missing route. A repo-wide grep for `134576216` returned zero matches, confirming a
never-written file rather than a typo'd filename serving another URL. Planning's RCA in `PLAN.md`
was confirmed as-is; there was nothing to correct.

The ticket's stated `404` was itself a mis-transcription (no idea linked, never checked upstream):
the missing path actually served the SPA `index.html` shell with `200 text/html`, not `404` —
re-confirmed live during this fix (see below). The underlying defect (route doesn't exist) is real
regardless of which status code was reported.

## Fix

Added the two files the route family requires: the handler and its colocated unit test. Copied
`routes/api/healthz-smoke-528856326-a.ts`/`.test.ts` verbatim, changing only the variant string to
`"134576216"` (handler) and the import path / describe title / URL / expected variant (test). No
shared handler, factory or constants file — duplication across this probe family is deliberate
(`ARCHITECTURE.md` § Key Decisions), so each probe stays independently buildable and mergeable.

## Regression test

`routes/api/healthz-smoke-bugfix-134576216.test.ts › GET /api/healthz-smoke-bugfix-134576216 ›
returns HTTP 200 with correct response body` — constructs a real `H3Event`, calls the handler
directly, and asserts `toEqual({ ok: true, variant: "134576216" })`. Red→green run recorded in
`tdd-test-result.md`.

Because the unit test imports the handler module directly, it cannot by itself prove Nitro wired
the route — a live request against a running dev server was also taken (see below) to prove that.

## Files touched

- `routes/api/healthz-smoke-bugfix-134576216.ts` — new handler, returns `{ ok: true, variant: "134576216" }`.
- `routes/api/healthz-smoke-bugfix-134576216.test.ts` — new colocated H3Event test, single body assertion, no timing case.

## Notes

Live verification against `bun run dev` (Vite bound `:5001`, `Port 5000 is in use, trying another
one...`):

```
/api/healthz-smoke-bugfix-134576216   200 application/json;charset=UTF-8  {"ok":true,"variant":"134576216"}
/api/healthz-smoke-528856326-a        200 application/json;charset=UTF-8  {"ok":true,"variant":"528856326"}  (control)
```

`bun run build` emits `.output/server/_routes/api/healthz_smoke_bugfix_134576216.mjs`, confirming
the route compiled into the production server. `git status --porcelain` shows exactly the two new
files; no other file under `routes/`, `middleware/`, `src/` or the repository root was touched, and
no dependency changed.
