# VRTX3-T-0001 — PLAN

**Defect**: `GET /api/healthz-smoke-bugfix-868175391` does not return `{"ok":true,"variant":"868175391"}`.
**Sprint**: VRTX3-S-0001 (`smoke-bugfix-1785889878831367`)
**Risk**: Low — additive only; no existing file is modified.

---

## 1. Reproduction (performed, not assumed)

Branch @ `94f7504`, 2026-08-05. Dev server (`bun run dev`, Vite 8 on :5000):

```console
$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/healthz-smoke-bugfix-868175391
200                                        # <-- NOT 404
$ curl -sD- http://localhost:5000/api/healthz-smoke-bugfix-868175391 | head -3
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8     # <-- the SPA index.html shell
```

Production build (`bun run build` && `bun .output/server/index.mjs`) — same result:

```console
$ curl -sD- http://localhost:3111/api/healthz-smoke-bugfix-868175391 | head -2
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

Control (an existing sibling) behaves correctly in both:

```console
$ curl -s http://localhost:5000/api/healthz-smoke-bugfix3-331988924
{"ok":true,"variant":"331988924"}
```

> **⚠ The ticket's and canvas's stated symptom is wrong.** Both claim the
> endpoint "returns 404". It does not — in **dev and production alike** the
> unmatched `/api/*` path is answered by the SPA fallback with **`200` and
> `text/html`**. The observable defect is _"HTML shell instead of the expected
> JSON"_. **Assert on the response body, never on a 404 status.** A
> fix-verification or QA step that waits for a 404-before / 200-after transition
> will report a false pass, because the status is 200 both before and after.
> This applies to all three defects — see `../SPRINT-PLAN.md`.

## 2. Root cause

Nitro 3 registers `/api/*` routes purely from files present on disk under
`routes/api/` (`vite.config.ts:29` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`).
`routes/api/healthz-smoke-bugfix-868175391.ts` **does not exist**, so no handler
is registered for the path; the request falls past the API router into the
static/SPA fallback.

```console
$ ls routes/api | grep 868175391
(no output)
```

Ruled out: (a) scanning disabled — 30 sibling routes resolve fine; (b) handler
excluded by the `**/*.test.ts` ignore glob — no file of any extension carries
this variant; (c) handler present but throwing — nothing exists to throw.

**The fix is additive**: create the file. Its presence _is_ the registration.

## 3. Fix

Create exactly two new files, copying the sibling pattern verbatim
(`routes/api/healthz-smoke-bugfix-26031336.ts` / `.test.ts`).

`routes/api/healthz-smoke-bugfix-868175391.ts`:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "868175391",
  };
});
```

`routes/api/healthz-smoke-bugfix-868175391.test.ts`: construct an `H3Event` over
`new Request("http://localhost/api/healthz-smoke-bugfix-868175391")`, invoke the
default export, assert the body and a `<100ms` latency bound — mirroring
`routes/api/healthz-smoke-bugfix-26031336.test.ts`.

**Do not** introduce a shared/parameterised healthz helper. The repo convention
is 30 independent self-contained handlers; refactoring them is out of scope.

## 4. Interface contract (fixed)

| Item          | Value                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Method + path | `GET /api/healthz-smoke-bugfix-868175391`                                                          |
| Status        | `200`                                                                                              |
| Content-Type  | `application/json` (**not** `text/html` — that is the bug)                                         |
| Body          | exactly `{"ok":true,"variant":"868175391"}` — two keys, no more                                    |
| `ok`          | boolean `true`                                                                                     |
| `variant`     | string `"868175391"` (quoted, not a number)                                                        |
| Handler file  | `routes/api/healthz-smoke-bugfix-868175391.ts`, default-exported `defineHandler` from `"nitro/h3"` |
| Test file     | `routes/api/healthz-smoke-bugfix-868175391.test.ts`                                                |
| Dependencies  | `nitro/h3` only — no auth, no `event.context`, no `db/`, no shared module                          |

## 5. Verification

```console
$ bun --bun vitest run routes/api/healthz-smoke-bugfix-868175391.test.ts   # 2 passed
$ bun run verify                                                           # lint + typecheck + full suite
```

Dev hand-check — assert the **body and Content-Type**, not the status:

```console
$ curl -s http://localhost:5000/api/healthz-smoke-bugfix-868175391
{"ok":true,"variant":"868175391"}
```

## 6. Files touched

- **Created**: `routes/api/healthz-smoke-bugfix-868175391.ts`
- **Created**: `routes/api/healthz-smoke-bugfix-868175391.test.ts`
- **Modified**: none.
