# Plan — VRTX3-T-0050: `/api/healthz-smoke-bugfix2-901895284` does not serve JSON

## Objective

`GET /api/healthz-smoke-bugfix2-901895284` must return `200`, `Content-Type: application/json`,
body exactly `{"ok":true,"variant":"901895284"}`. Today no Nitro route module exists for that
path, so the request falls through to the SPA `index.html` fallback. DONE when a self-contained
handler file plus its own integration test exist and `bun run verify` passes.

## Root cause (verified, not assumed)

`vite.config.ts` registers `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, so Nitro builds
its router by scanning `routes/api/**`. The route name is derived purely from the filename.

```bash
$ ls routes/api/ | grep 901895284
# (no output)
```

**The handler module was never written.** There is no bug in the router, the config, or any
existing handler — 79 files (≈40 endpoints) under `routes/api/` resolve correctly today. This is
a missing-file defect, not a broken code path. No registry, index or router table exists that
could have been forgotten; routing is entirely file-name driven.

### The ticket's "returns 404" claim is WRONG — re-measured on a live dev server

Reproduced on `bun run dev` (Vite, port 5000) on 2026-08-08:

| Path                                             | Status | Content-Type                     | Body                                |
| ------------------------------------------------ | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-bugfix2-901895284` (missing) | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…` (SPA shell)      |
| `/api/healthz-smoke-bugfix3-605591646` (control) | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"605591646"}` |

An unmatched `/api/*` path is answered by the SPA `index.html` fallback with **200 text/html**,
never `404`. The repro step in the ticket ("observe 404") cannot reproduce anything.

**Consequence for the fix: do not verify with a status-code check.** An
`expect(status).toBe(200)` assertion passes identically before and after the fix. Assert on the
**body** and **`Content-Type`**. This is the third sprint to hit this misdiagnosis (AGENT.md,
VRTX3-S-0001 and VRTX3-S-0007).

## Steps

1. Create `routes/api/healthz-smoke-bugfix2-901895284.ts`, copying the shape of the existing
   `routes/api/healthz-smoke-bugfix3-605591646.ts`:

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "901895284",
     };
   });
   ```

2. Create `routes/api/healthz-smoke-bugfix2-901895284.test.ts` following the H3Event integration
   pattern in `routes/api/healthz-smoke-bugfix3-605591646.test.ts`: construct a real `H3Event`
   from a `Request`, call the default export, assert
   `toEqual({ ok: true, variant: "901895284" })`.
3. Run `bun run verify` (lint + typecheck + test). No `db:generate`, no migration, no schema
   change is involved.

## File/module ownership

Creates only, modifies nothing:

- `routes/api/healthz-smoke-bugfix2-901895284.ts`
- `routes/api/healthz-smoke-bugfix2-901895284.test.ts`

No overlap with VRTX3-T-0049 or VRTX3-T-0051 — no `depends_on` required; all three may run fully
in parallel.

## Interface contracts (FIXED — do not change)

- Path: `/api/healthz-smoke-bugfix2-901895284` — note the `bugfix2` prefix, **not** `bugfix`
- Status: `200`
- `Content-Type`: `application/json` (served as `application/json;charset=UTF-8`)
- Body: `{ "ok": true, "variant": "901895284" }` — `ok` boolean `true`, `variant` **string**
  `"901895284"`, no other keys
- Module: default export from `defineHandler` imported from `nitro/h3`
- Method handling: handler is method-agnostic, matching every sibling. Verified against the
  control: `POST`/`PUT`/`DELETE` return the same `200` JSON body, not a 500. Do **not** add a
  method guard — that would diverge from the established pattern.
- No auth, no database, no middleware dependency, no code shared with any other endpoint

## Definition of Done

- [ ] `routes/api/healthz-smoke-bugfix2-901895284.ts` exists and default-exports a
      `defineHandler` returning `{ ok: true, variant: "901895284" }`.
- [ ] `routes/api/healthz-smoke-bugfix2-901895284.test.ts` exists, follows the H3Event pattern
      (`new H3Event(new Request(...))`, no live server), and asserts the result deep-equals
      `{ ok: true, variant: "901895284" }`.
- [ ] The test asserts on the response **body**, never on a 404→200 status transition.
- [ ] The handler imports neither `middleware/auth.ts` nor `db/client.ts` / `db/schema.ts`.
- [ ] Purely additive: exactly 2 new files, 0 existing files modified (`git diff --stat` shows no
      change to `vite.config.ts`, `nginx.conf`, or any existing route).
- [ ] `bun run verify` passes (lint zero-warning, typecheck, full Vitest suite), and the new test
      runs under the Vitest `server` project (`environment: "node"`, `routes/**/*.test.ts`).

## Test plan

- **Vitest (server project, node env):** `bun run test`. The new spec calls the handler with a
  real `H3Event` and asserts the exact body object. Expected: pass, with every pre-existing route
  test still green.
- **Manual runtime check (the honest signal):** `bun run dev`, then

  ```bash
  curl -s -w '%{http_code} %{content_type}\n' \
    http://localhost:5000/api/healthz-smoke-bugfix2-901895284
  ```

  Expect `{"ok":true,"variant":"901895284"}` with `200 application/json;charset=UTF-8`. Seeing
  `text/html` means the route is still not registered — the filename is wrong (most likely
  `bugfix` instead of `bugfix2`) or the file is missing.

- **Optional production-build check:** `bun run build` emits one module per route under
  `.output/server/_routes/api/`, with dashes converted to underscores — verified on this branch,
  where the control produced
  `.output/server/_routes/api/healthz_smoke_bugfix3_605591646.mjs`. After the fix expect
  `.output/server/_routes/api/healthz_smoke_bugfix2_901895284.mjs`.
- **No new Playwright spec** — server-only route with no UI surface.
