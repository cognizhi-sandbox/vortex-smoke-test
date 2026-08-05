# VRTX3-T-0002 — PLAN

**Defect**: `GET /api/healthz-smoke-bugfix2-101584827` does not return `{"ok":true,"variant":"101584827"}`.
**Sprint**: VRTX3-S-0001 (`smoke-bugfix-1785889878831367`)
**Risk**: Low — additive only; no existing file is modified.

---

## 1. Reproduction (performed, not assumed)

Branch @ `94f7504`, 2026-08-05. Dev server (`bun run dev`, Vite 8 on :5000):

```console
$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/healthz-smoke-bugfix2-101584827
200                                        # <-- NOT 404
$ curl -sD- http://localhost:5000/api/healthz-smoke-bugfix2-101584827 | head -3
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8     # <-- the SPA index.html shell
```

The production build (`bun .output/server/index.mjs`) behaves identically —
`200` + `text/html` for the unmatched path. Control sibling
`/api/healthz-smoke-bugfix3-331988924` correctly returns
`{"ok":true,"variant":"331988924"}` in both.

> **⚠ The ticket's stated symptom is wrong.** It claims the endpoint "404s". It
> does not — in **dev and production alike** the unmatched `/api/*` path is
> answered by the SPA fallback with **`200` and `text/html`**. The observable
> defect is _"HTML shell instead of the expected JSON"_. **Assert on the
> response body, never on a 404 status** — the status is 200 both before and
> after the fix, so a 404→200 check reports a false pass. See
> `../SPRINT-PLAN.md`.

## 2. Root cause

Nitro 3 registers `/api/*` routes from files on disk under `routes/api/`
(`vite.config.ts:29` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`).
`routes/api/healthz-smoke-bugfix2-101584827.ts` **does not exist**, so no handler
is registered and the request falls past the API router into the SPA fallback.

```console
$ ls routes/api | grep 101584827
(no output)
```

Ruled out: scanning disabled (30 siblings resolve); test-glob exclusion (no file
of any extension carries this variant); handler throwing (nothing exists).

**The fix is additive**: create the file. Its presence _is_ the registration.

## 3. Fix

Create exactly two new files, copying the sibling pattern verbatim
(`routes/api/healthz-smoke-bugfix2-59156521.ts` / `.test.ts`).

`routes/api/healthz-smoke-bugfix2-101584827.ts`:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "101584827",
  };
});
```

`routes/api/healthz-smoke-bugfix2-101584827.test.ts`: construct an `H3Event` over
`new Request("http://localhost/api/healthz-smoke-bugfix2-101584827")`, invoke the
default export, assert the body and a `<100ms` latency bound.

**Do not** introduce a shared/parameterised healthz helper — the repo convention
is independent self-contained handlers.

## 4. Interface contract (fixed)

| Item          | Value                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Method + path | `GET /api/healthz-smoke-bugfix2-101584827`                                                          |
| Status        | `200`                                                                                               |
| Content-Type  | `application/json` (**not** `text/html` — that is the bug)                                          |
| Body          | exactly `{"ok":true,"variant":"101584827"}` — two keys, no more                                     |
| `ok`          | boolean `true`                                                                                      |
| `variant`     | string `"101584827"` (quoted, not a number)                                                         |
| Handler file  | `routes/api/healthz-smoke-bugfix2-101584827.ts`, default-exported `defineHandler` from `"nitro/h3"` |
| Test file     | `routes/api/healthz-smoke-bugfix2-101584827.test.ts`                                                |
| Dependencies  | `nitro/h3` only — no auth, no `event.context`, no `db/`, no shared module                           |

Note the path segment is `bugfix2-` (not `bugfix-`); prefix **and** variant
digits must match exactly.

## 5. Verification

```console
$ bun --bun vitest run routes/api/healthz-smoke-bugfix2-101584827.test.ts   # 2 passed
$ bun run verify                                                            # lint + typecheck + full suite
$ curl -s http://localhost:5000/api/healthz-smoke-bugfix2-101584827
{"ok":true,"variant":"101584827"}
```

## 6. Files touched

- **Created**: `routes/api/healthz-smoke-bugfix2-101584827.ts`
- **Created**: `routes/api/healthz-smoke-bugfix2-101584827.test.ts`
- **Modified**: none.
