# Plan — VRTX3-T-0043: /api/healthz-smoke-bugfix-534542341 does not serve JSON

## Objective

`GET /api/healthz-smoke-bugfix-534542341` must return `200`, `Content-Type: application/json`,
body exactly `{"ok":true,"variant":"534542341"}`. Today no Nitro route module exists for that
path, so the request falls through to the SPA `index.html` fallback. DONE when a self-contained
handler file plus its own integration test exist, and `bun run verify` passes.

## Root cause (verified, not assumed)

`vite.config.ts:29` registers `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, so Nitro
builds its router by scanning `routes/api/**`. `ls routes/api/ | grep 534542341` returns nothing —
**the handler module was never written**. There is no bug in the router, the config, or any
existing handler; the route simply is not registered.

**The ticket's "returns 404" claim is WRONG and was re-verified against a live dev server.**
Observed on `bun run dev` (port 5000):

| Path                                            | Status | Content-Type                     | Body                                |
| ----------------------------------------------- | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-bugfix-534542341` (missing) | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-bugfix3-764107669` (exists) | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"764107669"}` |

An unmatched `/api/*` path is answered by the Vite/SPA `index.html` fallback with **200 text/html**,
never 404. Consequence for the fix: **do not verify with a status-code check** — a `expect(status).toBe(200)`
assertion passes identically before and after the fix. Assert on the body and `Content-Type`.

## Steps

1. Create `routes/api/healthz-smoke-bugfix-534542341.ts`, copying the shape of the existing
   `routes/api/healthz-smoke-bugfix3-764107669.ts`:

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "534542341",
     };
   });
   ```

2. Create `routes/api/healthz-smoke-bugfix-534542341.test.ts` following the H3Event integration
   pattern in `routes/api/healthz-smoke-bugfix3-764107669.test.ts`: construct a real `H3Event`
   from a `Request`, call the default export, assert `toEqual({ ok: true, variant: "534542341" })`.
3. Run `bun run verify` (lint + typecheck + test). No `bun run db:generate`, no migration, no
   schema change is involved.

## File/module ownership

Creates only, modifies nothing:

- `routes/api/healthz-smoke-bugfix-534542341.ts`
- `routes/api/healthz-smoke-bugfix-534542341.test.ts`

No overlap with VRTX3-T-0044 or VRTX3-T-0045 — no `depends_on` required, all three may run fully
in parallel.

## Interface contracts (FIXED — do not change)

- Path: `/api/healthz-smoke-bugfix-534542341` (GET; handler is method-agnostic, matching siblings)
- Status: `200`
- `Content-Type`: `application/json`
- Body: `{ "ok": true, "variant": "534542341" }` — `ok` boolean `true`, `variant` **string** `"534542341"`, no other keys
- Module: default export from `defineHandler` imported from `nitro/h3`
- No auth, no database, no middleware dependency, no code shared with any other endpoint

## Definition of Done

- [ ] `routes/api/healthz-smoke-bugfix-534542341.ts` exists and default-exports a `defineHandler`
      returning `{ ok: true, variant: "534542341" }`.
- [ ] `routes/api/healthz-smoke-bugfix-534542341.test.ts` exists and asserts the response object
      deep-equals `{ ok: true, variant: "534542341" }`.
- [ ] The test asserts on the response **body**, not on a 404→200 status transition.
- [ ] No existing file is modified; no shared helper is introduced.
- [ ] `bun run verify` passes (lint zero-warning, typecheck, full Vitest suite).

## Test plan

- **Vitest (server project, `routes/**`→ node env):**`bun run test`. New spec calls the handler
with a real `H3Event` and asserts the exact body object. Expected: pass; every pre-existing
  route test still passes.
- **Manual/optional runtime check:** `bun run dev`, then
  `curl -s -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix-534542341`
  → expect `{"ok":true,"variant":"534542341"}` with `200 application/json;charset=UTF-8`.
  Seeing `text/html` means the route still is not registered.
- **No new Playwright spec** — this is a server-only route with no UI surface.
