# VRTX3-T-0001 — Fix Note

## Root cause

Nitro 3 registers `/api/*` routes purely from files present on disk under
`routes/api/` (`vite.config.ts:29` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`).
`routes/api/healthz-smoke-bugfix-868175391.ts` did not exist, so no handler
was ever registered for that path. The request fell through to the SPA
fallback, which serves `index.html` with **HTTP 200** and
`Content-Type: text/html` — not a 404 as the ticket title claimed. Reproduced
on `94f7504` in both `bun run dev` and the production build
(`.output/server/index.mjs`); nginx does not alter this since
`proxy_intercept_errors` is off.

Ruled out: directory scanning disabled (30 sibling routes resolve fine);
handler hidden by the `**/*.test.ts` ignore glob (no file of any extension
carried this variant); handler present but throwing (nothing existed to
throw). The fix is purely additive — the file's presence _is_ the route
registration.

## Fix

Added exactly two new files, copying the sibling
`routes/api/healthz-smoke-bugfix-26031336.ts` / `.test.ts` pattern verbatim:

- `routes/api/healthz-smoke-bugfix-868175391.ts` — default-exports a
  `defineHandler` from `"nitro/h3"` returning
  `{ ok: true, variant: "868175391" }`. No auth, no `event.context`, no `db/`
  import, no shared helper module.
- `routes/api/healthz-smoke-bugfix-868175391.test.ts` — constructs an
  `H3Event` over `new Request("http://localhost/api/healthz-smoke-bugfix-868175391")`,
  invokes the default export, and asserts `toEqual({ ok: true, variant: "868175391" })`
  plus a <100ms latency bound.

No existing file was modified.

## Files touched

- Created: `routes/api/healthz-smoke-bugfix-868175391.ts`
- Created: `routes/api/healthz-smoke-bugfix-868175391.test.ts`
- Modified: none
