# Fix note — VRTX3-T-0050

## Root cause

`GET /api/healthz-smoke-bugfix2-901895284` never served JSON because the handler module
`routes/api/healthz-smoke-bugfix2-901895284.ts` was never written. Nitro derives `/api/<name>`
routes purely from filenames under `routes/api/` (`vite.config.ts`:
`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`). `ls routes/api/ | grep 901895284`
returned nothing before this fix — ~40 sibling endpoints resolve fine, so nothing is
misconfigured. This was a missing-file defect, not a broken code path.

Note: the ticket's "returns 404" claim does not reproduce. An unmatched `/api/*` path is
answered by the SPA `index.html` fallback with `200 text/html`, not `404` — confirmed against
the working control `/api/healthz-smoke-bugfix3-605591646` which returns
`200 application/json;charset=UTF-8`. A status-code-only check passes identically before and
after the fix, so verification must assert on body + `Content-Type`.

## Minimal fix

Added the missing handler, copying the shape of the sibling control endpoint
(`routes/api/healthz-smoke-bugfix3-605591646.ts`), substituting variant `901895284`. No existing
files were touched.

## Files touched

- `routes/api/healthz-smoke-bugfix2-901895284.ts` (new) — default-exports a `defineHandler`
  (from `nitro/h3`) returning `{ ok: true, variant: "901895284" }`. No auth, no database, no
  method guard — method-agnostic like all siblings.
- `routes/api/healthz-smoke-bugfix2-901895284.test.ts` (new) — H3Event integration test,
  asserting the handler's return value deep-equals `{ ok: true, variant: "901895284" }`.

Purely additive: 2 new files, 0 existing files modified (`git diff --stat` is empty).
