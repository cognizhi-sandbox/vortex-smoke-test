# VRTX3-T-0003 — PLAN

**Defect**: `GET /api/healthz-smoke-bugfix3-403022997` does not return `{"ok":true,"variant":"403022997"}`.
**Sprint**: VRTX3-S-0001 (`smoke-bugfix-1785889878831367`) · Idea `VRTX3-I-0001`
**Risk**: Low — additive only; no existing file is modified.

---

## 1. Reproduction (performed, not assumed)

Branch @ `94f7504`, 2026-08-05. Dev server (`bun run dev`, Vite 8 on :5000):

```console
$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/healthz-smoke-bugfix3-403022997
200                                        # <-- NOT 404
$ curl -sD- http://localhost:5000/api/healthz-smoke-bugfix3-403022997 | head -3
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8     # <-- the SPA index.html shell
```

Production build (`bun run build` && `PORT=3111 bun .output/server/index.mjs`):

```console
$ curl -sD- http://localhost:3111/api/healthz-smoke-bugfix3-403022997 | head -2
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8     # <-- same fallback, still not a 404
```

Control (existing sibling), correct in both environments:

```console
$ curl -s http://localhost:5000/api/healthz-smoke-bugfix3-331988924
{"ok":true,"variant":"331988924"}
```

> **⚠ Correction to the canvas (VRTX3-I-0001).** The canvas asserts _"the
> request falls through the router to Nitro's default not-found response — a
> 404"_, and its Mermaid diagram shows `404 Not Found ❌`. **That is not what
> happens.** Nitro serves `.output/public/index.html` as an SPA fallback, so the
> unmatched `/api/*` path returns **`200 text/html`** in dev _and_ in the
> production server. (Behind `nginx.conf` the `/api/` location proxies straight
> to Nitro and `proxy_intercept_errors` is off, so nginx does not change this
> either.) The canvas's Fix-AC #1 — _"returns HTTP 200 (currently 404)"_ — is
> therefore untestable as written: the status is 200 before **and** after.
> **Assert on the response body and Content-Type instead.** The AC list in §4/§5
> below supersedes it.

## 2. Root cause

Nitro 3 registers `/api/*` routes purely from files present on disk under
`routes/api/` (`vite.config.ts:29` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`;
`ARCHITECTURE.md:50` states the same rule). `routes/api/healthz-smoke-bugfix3-403022997.ts`
**does not exist**, so no handler is registered for the path and the request
falls past the API router into the static/SPA fallback.

```console
$ ls routes/api | grep 403022997
(no output)
```

Ruled out: (a) scanning disabled — `serverDir: "./"` is set and 30 sibling routes
resolve; (b) handler excluded by the `**/*.test.ts` ignore glob — no file of any
extension carries this variant; (c) handler present but throwing — nothing
exists to throw.

**The fix is additive**: create the file. Its presence _is_ the registration.

## 3. Fix

Create exactly two new files, copying the sibling pattern verbatim
(`routes/api/healthz-smoke-bugfix3-331988924.ts` / `.test.ts`).

`routes/api/healthz-smoke-bugfix3-403022997.ts`:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "403022997",
  };
});
```

`routes/api/healthz-smoke-bugfix3-403022997.test.ts`: construct an `H3Event` over
`new Request("http://localhost/api/healthz-smoke-bugfix3-403022997")`, invoke the
default export, assert the body and a `<100ms` latency bound.

Keep the handler **context-free** — do not read `event.context`. `middleware/auth.ts`
runs before every handler and sets a hardcoded `event.context.user`;
`routes/api/hello.ts` depends on it, the healthz siblings deliberately do not.

**Do not** introduce a shared/parameterised healthz helper — refactoring the
other 29 near-identical handlers is out of scope for a defect fix.

## 4. Interface contract (fixed)

| Item          | Value                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Method + path | `GET /api/healthz-smoke-bugfix3-403022997`                                                          |
| Status        | `200`                                                                                               |
| Content-Type  | `application/json` (**not** `text/html` — that is the bug)                                          |
| Body          | exactly `{"ok":true,"variant":"403022997"}` — two keys, no more                                     |
| `ok`          | boolean `true`                                                                                      |
| `variant`     | string `"403022997"` (quoted, not a number)                                                         |
| Handler file  | `routes/api/healthz-smoke-bugfix3-403022997.ts`, default-exported `defineHandler` from `"nitro/h3"` |
| Test file     | `routes/api/healthz-smoke-bugfix3-403022997.test.ts`                                                |
| Dependencies  | `nitro/h3` only — no auth, no `event.context`, no `db/`, no shared module                           |

Note the path segment is `bugfix3-` (not `bugfix-` / `bugfix2-`); prefix **and**
variant digits must match exactly.

## 5. Verification

```console
$ bun --bun vitest run routes/api/healthz-smoke-bugfix3-403022997.test.ts   # 2 passed
$ bun run verify                                                            # lint + typecheck + full suite
$ curl -s http://localhost:5000/api/healthz-smoke-bugfix3-403022997
{"ok":true,"variant":"403022997"}
```

The new test lands in Vitest's `server` project (`include: routes/**/*.test.ts`,
`environment: "node"`), and is kept out of the production bundle by the existing
`nitro({ ignore: ["**/*.test.ts"] })` glob — both automatic from the file's name
and location.

## 6. Files touched

- **Created**: `routes/api/healthz-smoke-bugfix3-403022997.ts`
- **Created**: `routes/api/healthz-smoke-bugfix3-403022997.test.ts`
- **Modified**: none.
