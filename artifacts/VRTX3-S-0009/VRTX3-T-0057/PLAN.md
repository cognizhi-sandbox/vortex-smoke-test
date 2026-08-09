# Plan — VRTX3-T-0057: `/api/healthz-smoke-bugfix3-993514120` returns the SPA shell instead of `{ok,variant}`

## Root cause

Nitro discovers server routes purely from the filesystem — `vite.config.ts:29`:

```ts
nitro({ serverDir: "./", ignore: ["**/*.test.ts"] }),
```

`routes/api/<name>.ts` maps to `/api/<name>`. There is no route table and no manual
registration. `grep -rl 993514120 .` over the repo returns **no match** — the handler file was
simply never created, so no route is registered and the request falls through to the SPA
`index.html` shell. Nine other `bugfix3-*` siblings exist and work; this variant was skipped.
There is no bug in existing code; the fix is purely additive.

**The ticket's "Actual: 404" is wrong** — as the idea canvas itself flagged. The canvas cited
prior sprint records rather than measuring; I measured it this sprint on `bun run dev`:

| Path                                             | Status | Content-Type                     | Body                                |
| ------------------------------------------------ | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-bugfix3-993514120` (today)   | `200`  | `text/html; charset=utf-8`       | `<!doctype html>…`                  |
| `/api/healthz-smoke-bugfix3-221117839` (control) | `200`  | `application/json;charset=UTF-8` | `{"ok":true,"variant":"221117839"}` |

The canvas's prediction is confirmed. The status is `200` both before and after the fix.
**Verify on `Content-Type` + body, never on a `404 → 200` transition** — such a check passes
whether or not the route exists.

## Objective

`GET /api/healthz-smoke-bugfix3-993514120` serves `200` with `Content-Type: application/json`
and the exact body `{"ok":true,"variant":"993514120"}`, backed by a co-located H3Event
integration test — matching the 44 existing `healthz-smoke-*` siblings byte-for-byte in shape.

## Steps

1. Create `routes/api/healthz-smoke-bugfix3-993514120.ts` by copying
   `routes/api/healthz-smoke-bugfix3-221117839.ts` and changing only the variant digits:

   ```ts
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "993514120",
     };
   });
   ```

2. Create `routes/api/healthz-smoke-bugfix3-993514120.test.ts` by copying
   `routes/api/healthz-smoke-bugfix3-221117839.test.ts`, updating the import path, the
   `describe` title, the request URL and the asserted `variant`.
3. Run the repo's standard verification gate (your role defines which) and confirm the new
   test is collected by the vitest **`server`** project.
4. Against a running dev server, confirm the endpoint returns `application/json` — and confirm
   a deliberately nonexistent sibling path still returns `text/html`, proving your check
   discriminates a real route from the SPA fallback.

## File/module ownership

| File                                                 | Change  |
| ---------------------------------------------------- | ------- |
| `routes/api/healthz-smoke-bugfix3-993514120.ts`      | **new** |
| `routes/api/healthz-smoke-bugfix3-993514120.test.ts` | **new** |

These two files and nothing else. No file outside `routes/api/` is in scope for this ticket —
no existing route, no `vite.config.ts` / `vitest.config.ts` / `nginx.conf`, no `db/`, no
`middleware/`, no frontend file, and **no documentation of any kind** (all docs for this
sprint are already handled on the planning ticket). This supersedes the canvas's own fix-AC
list, which offered optional changelog appends — those are not yours to make.

No overlap with VRTX3-T-0055 or VRTX3-T-0056 — all three run in parallel, no `depends_on`.

## Interface contracts (FIXED — do not change)

- **Route path**: `/api/healthz-smoke-bugfix3-993514120`, derived solely from the filename.
  Note the `bugfix3` segment — the family prefix differs from its sibling tickets.
- **Response body**: exactly `{ ok: true, variant: "993514120" }` — two keys, `variant` is a
  **string** of digits, no extra fields. The variant does **not** carry the `3`.
- **Handler shape**: default export of `defineHandler` imported from `"nitro/h3"`.
- **Method-agnostic**: no method guard. Measured on the control this sprint — `POST`/`PUT`/
  `DELETE` all return the same `200` JSON body as `GET`. All 44 siblings behave this way.
- **Zero code sharing**: self-contained file; do not import from or factor out a helper with
  any sibling route.

## Definition of Done

1. `routes/api/healthz-smoke-bugfix3-993514120.ts` exists and default-exports a `defineHandler`
   from `"nitro/h3"` returning exactly `{ ok: true, variant: "993514120" }`, structurally
   identical to `routes/api/healthz-smoke-bugfix3-221117839.ts`.
2. On a running dev server, `GET /api/healthz-smoke-bugfix3-993514120` responds with
   `Content-Type` matching `application/json` and a body deep-equal to
   `{"ok":true,"variant":"993514120"}`. All three of status, content type and body are checked;
   a status-code-only assertion is explicitly insufficient here.
3. `routes/api/healthz-smoke-bugfix3-993514120.test.ts` exists, follows the H3Event integration
   pattern of `routes/api/healthz-smoke-bugfix3-221117839.test.ts` (construct
   `new H3Event(new Request(...))`, await the default export), and asserts the returned object
   deep-equals `{ ok: true, variant: "993514120" }`.
4. The handler returns the same object regardless of HTTP method — no `405`, no method guard.
5. The change is purely additive: the only files added or modified are the two named in
   File/module ownership.

## Test plan

| Test                                          | Location                                             | Asserts                                                                 |
| --------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `returns HTTP 200 with correct response body` | `routes/api/healthz-smoke-bugfix3-993514120.test.ts` | `await handler(event)` deep-equals `{ ok: true, variant: "993514120" }` |
| `responds in under 100ms`                     | same file                                            | elapsed < 100ms, mirroring the sibling                                  |

Both run in the vitest **`server`** project (`environment: "node"`) — the test must sit under
`routes/` or it runs under jsdom and fails on `nitro/h3`, and it must end in `.test.ts` or the
Nitro scan bundles it into the production server as a route handler.

**Manual check (do not skip):** the unit test imports the handler module directly, so it passes
even if Nitro never registers the path. Only the live `Content-Type` check in DoD-2 proves the
route is actually wired. A useful extra confirmation is that the production build emits one
module per route under `.output/server/_routes/api/` with dashes converted to underscores.
