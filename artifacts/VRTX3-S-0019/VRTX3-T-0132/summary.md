# Summary — VRTX3-T-0132

## What changed

Added the self-contained health probe `GET /api/healthz-smoke-472035881-a`, copied from `routes/api/healthz-smoke-528856326-a.ts` (and its test) per `PLAN.md`, with the variant string changed to `"472035881"`.

## Files

- `routes/api/healthz-smoke-472035881-a.ts` — new handler, returns `{ ok: true, variant: "472035881" }`.
- `routes/api/healthz-smoke-472035881-a.test.ts` — colocated integration test, single body assertion (no elapsed-time case).

## AC coverage

- Handler shape / literal body — `healthz-smoke-472035881-a.ts` matches the fixed interface contract in `PLAN.md`.
- Live route wiring — verified against the production build on a local server (see Verification); returned `application/json` with the exact JSON body, not the SPA `text/html` shell.
- Test file — imports the handler directly, one `it()` case, no elapsed-time assertion.
- Green in Vitest `server` project + full gate — see Verification.
- Production build — emitted `.output/server/_routes/api/healthz_smoke_472035881_a.mjs`; no `*.test.ts` in the bundle.
- No shared code — handler imports only `nitro/h3`.
- Diff scope — exactly the two new files listed above; no existing file modified, no dependency added.

## Verification

- `bun --bun vitest run routes/api/healthz-smoke-472035881-a.test.ts` — 1 passed (also run red, with the handler temporarily removed, to confirm a genuine failure first).
- `bun run verify` (lint && typecheck && test) — all green: 76 test files / 136 tests passed.
- `bun run build` — succeeded; emitted the expected `_routes/api/healthz_smoke_472035881_a.mjs`.
- Live check on the built server (port 5910): target route → `200 application/json;charset=UTF-8` `{"ok":true,"variant":"472035881"}`; control `/api/healthz-smoke-528856326-a` → `200 application/json;charset=UTF-8` `{"ok":true,"variant":"528856326"}`.
