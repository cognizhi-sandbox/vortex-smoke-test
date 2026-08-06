# Fix Note — VRTX3-T-0043

## Root cause

`vite.config.ts:29` registers `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, so Nitro
builds its router by scanning `routes/api/**`. No file named `healthz-smoke-bugfix-534542341.ts`
existed in `routes/api/`, so no route was registered for that path. There is no bug in the
router, the config, or any existing handler — the handler module was simply never written.

The ticket's "returns 404" claim is factually wrong: an unmatched `/api/*` path is answered by
the SPA `index.html` fallback with `200 text/html`, not `404`. Verified live on `bun run dev`
before the fix — see `tdd-test-result.md` for the RED-phase proof (module-not-found, not a
status-code check).

## Minimal fix

Created two brand-new files; modified nothing existing:

- `routes/api/healthz-smoke-bugfix-534542341.ts` — `defineHandler` (from `nitro/h3`), default
  export, returns `{ ok: true, variant: "534542341" }`. Copies the shape of the working sibling
  `routes/api/healthz-smoke-bugfix3-764107669.ts`.
- `routes/api/healthz-smoke-bugfix-534542341.test.ts` — H3Event integration test, copies
  `routes/api/healthz-smoke-bugfix3-764107669.test.ts`, asserts the handler's return value
  deep-equals `{ ok: true, variant: "534542341" }` (body assertion, not a status-code check).

No shared helper/constant/factory introduced — this endpoint has no auth, no database, and no
code shared with any other endpoint, per the ticket's independence contract.

## Files touched

- `routes/api/healthz-smoke-bugfix-534542341.ts` (new)
- `routes/api/healthz-smoke-bugfix-534542341.test.ts` (new)
- `artifacts/VRTX3-S-0007/VRTX3-T-0043/fix-note.md` (new, this file)
- `artifacts/VRTX3-S-0007/VRTX3-T-0043/tdd-test-result.md` (new)
