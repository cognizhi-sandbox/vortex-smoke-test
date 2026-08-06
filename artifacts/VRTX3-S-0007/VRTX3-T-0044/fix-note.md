# Fix note — VRTX3-T-0044

## Root cause

`vite.config.ts:29` registers `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, so Nitro
builds its router by scanning `routes/api/**`. The handler module for
`/api/healthz-smoke-bugfix2-279986033` was never written — `ls routes/api/ | grep 279986033`
returned nothing before the fix. Sibling `bugfix2-` variants (`…-101584827`, `…-524723214`,
`…-59156521`, …) all exist and work, ruling out any prefix- or config-level cause; a single file
was simply missing.

Note: the ticket's "returns 404" framing is not accurate. An unmatched `/api/*` path is answered
by the SPA `index.html` fallback with `200 text/html`, never a 404 — verified live against
`bun run dev` (see `tdd-test-result.md`). A status-code-only check would pass identically whether
or not the route exists, so verification here is on response body / `Content-Type`, not status.

## Minimal fix

Added exactly two new files, modified nothing:

- `routes/api/healthz-smoke-bugfix2-279986033.ts` — `defineHandler` (from `nitro/h3`), default
  export, returns `{ ok: true, variant: "279986033" }`. Shape copied from the sibling
  `routes/api/healthz-smoke-bugfix2-101584827.ts`.
- `routes/api/healthz-smoke-bugfix2-279986033.test.ts` — H3Event integration test, pattern copied
  from `routes/api/healthz-smoke-bugfix3-764107669.test.ts`.

No shared helper/constant/factory introduced; no auth, no database, no code shared with any other
endpoint. Fully independent of VRTX3-T-0043 and VRTX3-T-0045.

## Files touched

- `routes/api/healthz-smoke-bugfix2-279986033.ts` (new)
- `routes/api/healthz-smoke-bugfix2-279986033.test.ts` (new)
- `artifacts/VRTX3-S-0007/VRTX3-T-0044/fix-note.md` (new, this file)
- `artifacts/VRTX3-S-0007/VRTX3-T-0044/tdd-test-result.md` (new)
