# Plan — VRTX3-T-0045: /api/healthz-smoke-bugfix3-605591646 does not serve JSON

## Objective

`GET /api/healthz-smoke-bugfix3-605591646` must return `200`, `Content-Type: application/json`,
body exactly `{"ok":true,"variant":"605591646"}`. Today no Nitro route module exists for that
path, so the request falls through to the SPA `index.html` fallback. DONE when a self-contained
handler file plus its own integration test exist, and `bun run verify` passes.

## Root cause (verified, not assumed)

The canvas's flowchart is **correct up to its last node**. Confirmed: `vite.config.ts:29`
registers `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`; Nitro builds its router from
`routes/api/**`; the sibling `routes/api/healthz-smoke-bugfix3-764107669.ts` exists and answers
`{"ok":true,"variant":"764107669"}`; `ls routes/api/ | grep 605591646` returns nothing.
**The handler module was never written** — that is the entire root cause.

**Where the canvas is wrong:** its terminal node says the unmatched path yields `404 Not Found`.
It does not. Re-verified against a live dev server (`bun run dev`, port 5000):

| Path                                             | Status | Content-Type                     | Body                                |
| ------------------------------------------------ | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-bugfix3-605591646` (missing) | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-bugfix3-764107669` (exists)  | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"764107669"}` |

The unmatched `/api/*` request never reaches an H3 404 fallback — the SPA `index.html` fallback
answers it with **200 text/html** (in dev and in the production build alike; see the AGENT.md
gotcha recorded by sprint VRTX3-S-0001). Consequence for the fix: **do not verify with a
status-code check** — `expect(status).toBe(200)` passes identically before and after the fix.
Assert on the body and `Content-Type`.

## Steps

1. Create `routes/api/healthz-smoke-bugfix3-605591646.ts`, copying the shape of the existing
   `routes/api/healthz-smoke-bugfix3-764107669.ts`:

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "605591646",
     };
   });
   ```

2. Create `routes/api/healthz-smoke-bugfix3-605591646.test.ts` following the H3Event integration
   pattern in `routes/api/healthz-smoke-bugfix3-764107669.test.ts`: construct a real `H3Event`
   from a `Request`, call the default export, assert `toEqual({ ok: true, variant: "605591646" })`.
3. Run `bun run verify` (lint + typecheck + test). No schema change, no migration.

## File/module ownership

Creates only, modifies nothing:

- `routes/api/healthz-smoke-bugfix3-605591646.ts`
- `routes/api/healthz-smoke-bugfix3-605591646.test.ts`

No overlap with VRTX3-T-0043 or VRTX3-T-0044 — no `depends_on` required, all three may run fully
in parallel.

## Interface contracts (FIXED — do not change)

- Path: `/api/healthz-smoke-bugfix3-605591646` (GET; handler is method-agnostic, matching siblings)
- Status: `200`
- `Content-Type`: `application/json`
- Body: `{ "ok": true, "variant": "605591646" }` — `ok` boolean `true`, `variant` **string** `"605591646"`, no other keys
- Module: default export from `defineHandler` imported from `nitro/h3`
- No auth, no database, no middleware dependency, no code shared with any other endpoint

## Definition of Done

- [ ] `routes/api/healthz-smoke-bugfix3-605591646.ts` exists and default-exports a `defineHandler`
      returning `{ ok: true, variant: "605591646" }`.
- [ ] `routes/api/healthz-smoke-bugfix3-605591646.test.ts` exists and asserts the response object
      deep-equals `{ ok: true, variant: "605591646" }`.
- [ ] The test asserts on the response **body**, not on a 404→200 status transition.
- [ ] No existing file is modified; no shared helper is introduced.
- [ ] `bun run verify` passes (lint zero-warning, typecheck, full Vitest suite).

## Test plan

- **Vitest (server project, `routes/**`→ node env):**`bun run test`. New spec calls the handler
with a real `H3Event` and asserts the exact body object. Expected: pass; every pre-existing
  route test still passes.
- **Manual/optional runtime check:** `bun run dev`, then
  `curl -s -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix3-605591646`
  → expect `{"ok":true,"variant":"605591646"}` with `200 application/json;charset=UTF-8`.
  Seeing `text/html` means the route still is not registered.
- **No new Playwright spec** — server-only route, no UI surface.
