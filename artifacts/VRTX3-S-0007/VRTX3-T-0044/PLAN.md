# Plan — VRTX3-T-0044: /api/healthz-smoke-bugfix2-279986033 does not serve JSON

## Objective

`GET /api/healthz-smoke-bugfix2-279986033` must return `200`, `Content-Type: application/json`,
body exactly `{"ok":true,"variant":"279986033"}`. Today no Nitro route module exists for that
path, so the request falls through to the SPA `index.html` fallback. DONE when a self-contained
handler file plus its own integration test exist, and `bun run verify` passes.

## Root cause (verified, not assumed)

`vite.config.ts:29` registers `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, so Nitro
builds its router by scanning `routes/api/**`. `ls routes/api/ | grep 279986033` returns nothing —
**the handler module was never written**. Sibling `bugfix2-` variants (`…-101584827`, `…-524723214`,
`…-59156521`, `…-93488734`, …) all exist and work, which rules out any prefix- or config-level
cause. Nothing is broken; a file is simply absent.

**The ticket's "returns 404" claim is WRONG and was re-verified against a live dev server.**
Observed on `bun run dev` (port 5000):

| Path                                             | Status | Content-Type                     | Body                                |
| ------------------------------------------------ | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-bugfix2-279986033` (missing) | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-bugfix3-764107669` (exists)  | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"764107669"}` |

An unmatched `/api/*` path is answered by the SPA `index.html` fallback with **200 text/html**,
never 404. Consequence for the fix: **do not verify with a status-code check** — it passes
identically before and after the fix. Assert on the body and `Content-Type`.

## Steps

1. Create `routes/api/healthz-smoke-bugfix2-279986033.ts`, copying the shape of the existing
   `routes/api/healthz-smoke-bugfix2-101584827.ts`:

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "279986033",
     };
   });
   ```

2. Create `routes/api/healthz-smoke-bugfix2-279986033.test.ts` following the H3Event integration
   pattern: construct a real `H3Event` from a `Request`, call the default export, assert
   `toEqual({ ok: true, variant: "279986033" })`.
3. Run `bun run verify` (lint + typecheck + test). No schema change, no migration.

## File/module ownership

Creates only, modifies nothing:

- `routes/api/healthz-smoke-bugfix2-279986033.ts`
- `routes/api/healthz-smoke-bugfix2-279986033.test.ts`

No overlap with VRTX3-T-0043 or VRTX3-T-0045 — no `depends_on` required, all three may run fully
in parallel.

## Interface contracts (FIXED — do not change)

- Path: `/api/healthz-smoke-bugfix2-279986033` (GET; handler is method-agnostic, matching siblings)
- Status: `200`
- `Content-Type`: `application/json`
- Body: `{ "ok": true, "variant": "279986033" }` — `ok` boolean `true`, `variant` **string** `"279986033"`, no other keys
- Module: default export from `defineHandler` imported from `nitro/h3`
- No auth, no database, no middleware dependency, no code shared with any other endpoint

## Definition of Done

- [ ] `routes/api/healthz-smoke-bugfix2-279986033.ts` exists and default-exports a `defineHandler`
      returning `{ ok: true, variant: "279986033" }`.
- [ ] `routes/api/healthz-smoke-bugfix2-279986033.test.ts` exists and asserts the response object
      deep-equals `{ ok: true, variant: "279986033" }`.
- [ ] The test asserts on the response **body**, not on a 404→200 status transition.
- [ ] No existing file is modified; no shared helper is introduced.
- [ ] `bun run verify` passes (lint zero-warning, typecheck, full Vitest suite).

## Test plan

- **Vitest (server project, `routes/**`→ node env):**`bun run test`. New spec calls the handler
with a real `H3Event` and asserts the exact body object. Expected: pass; every pre-existing
  route test still passes.
- **Manual/optional runtime check:** `bun run dev`, then
  `curl -s -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix2-279986033`
  → expect `{"ok":true,"variant":"279986033"}` with `200 application/json;charset=UTF-8`.
  Seeing `text/html` means the route still is not registered.
- **No new Playwright spec** — server-only route, no UI surface.
