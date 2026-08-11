# VRTX3-T-0139 — Fix plan

**Sprint:** VRTX3-S-0020 · **Type:** DEFECT · **Route:** `/api/healthz-smoke-bugfix3-287868165` · **Variant:** `"287868165"`

Sprint-level index and shared notes: [`../SPRINT-PLAN.md`](../SPRINT-PLAN.md).

---

## 1. Reproduction (measured, not assumed)

Measured on this branch against a live dev server on 2026-08-11. Vite bound `:5000` in this
planning container — read the port from the Vite banner rather than assuming it, the last three
sprints bound `:5005`, `:5006` and `:5007`:

```
GET /api/healthz-smoke-bugfix3-287868165
  → 200  text/html; charset=utf-8        body: <!doctype html><html lang="en">…  949 bytes  (the SPA shell)

GET /api/healthz-smoke-528856326-a               (control — this route exists)
  → 200  application/json;charset=UTF-8   body: {"ok":true,"variant":"528856326"}   33 bytes
```

**The ticket's reported symptom "404" is incorrect.** An unmatched `/api/*` path is answered by the
SPA `index.html` fallback with **HTTP 200**, in dev and in the production build alike —
`nginx.conf:28` proxies `location /api/` straight to Nitro and does not set
`proxy_intercept_errors`, so it does not change this either. The defect is real; only its stated
status code is wrong. Consequence for this ticket: a `404 → 200` assertion proves nothing, because
the path already returns 200. **Verify on the response body and `Content-Type`.**

## 2. Root cause

**The handler file was never created.** This is a missing-artifact defect — not a regression, not a
misconfiguration.

Nitro 3 resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts`. There is no route
registry, no manifest, no import to update: a file that was never written is a path that was never
registered, and the request falls through to the SPA catch-all.

Verified by direct inspection of this branch:

```bash
$ grep -rl "287868165" . --exclude-dir=node_modules --exclude-dir=.git
$   # zero matches repository-wide
```

Zero matches rules out a filename typo in an existing route — nothing was written at all.

**Ruled out by reading the code:**

| Candidate cause                            | Why it is not this                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Nitro directory scanning disabled          | `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` is set at `vite.config.ts:29`, and 71 sibling probes resolve |
| Handler exists but excluded from the build | `ignore` matches only `**/*.test.ts`; there is no handler file to exclude                                           |
| Wrong export shape / broken handler        | No file exists to export anything                                                                                   |
| Filename typo under a near-miss name       | Repo-wide grep for `287868165` returns zero matches                                                                 |
| Middleware short-circuiting the request    | `middleware/auth.ts` only sets `event.context.user`; it never returns a response                                    |
| nginx dropping the path                    | `nginx.conf:28` proxies all of `/api/` through with no per-route allowlist                                          |

## 3. Fix

Add two new files, following `routes/api/healthz-smoke-528856326-a.ts` and its colocated test
**verbatim** apart from the variant string and the route name. Modify nothing else.

1. `routes/api/healthz-smoke-bugfix3-287868165.ts` — default-export a single `defineHandler`
   imported from `nitro/h3`, taking no parameters, returning the literal
   `{ ok: true, variant: "287868165" }`.
2. `routes/api/healthz-smoke-bugfix3-287868165.test.ts` — mirror the sibling spec: construct an
   `H3Event` from a `Request` for the route's URL, call the handler, and assert the resolved value
   equals `{ ok: true, variant: "287868165" }`. **One assertion only.**

**Fixed interface contract — do not deviate:**

```ts
// routes/api/healthz-smoke-bugfix3-287868165.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "287868165",
  };
});
```

**Constraints:**

- **Copy the `528856326` pair, not an older probe.** Tests written before VRTX3-S-0011 carry a
  second `responds in under 100ms` case. That wall-clock assertion is machine-dependent, is a known
  CI flake source, and proves nothing about the contract — **do not add it**
  (`AGENT.md` § Health Probe Routes).
- No auth: the handler must not read `event.context.user`.
- No database: no import from `db/`.
- No shared code: no helper, factory, constants file or barrel export, and no import from any
  sibling probe. The duplication is a deliberate architectural decision
  (`ARCHITECTURE.md` § Key Decisions) — factoring it out fails this ticket.
- No method guard. The siblings have none, so every HTTP verb returns the same body; keep it.
- The test file must be named `*.test.ts` — `vite.config.ts:29` excludes only that pattern from the
  server build, so any other name ships the test as a route handler.
- Root docs (`AGENT.md` / `PRODUCT.md` / `ARCHITECTURE.md` / `DESIGN.md`) are **out of scope**; they
  were brought to target state on the planning ticket. Do not modify them.

## 4. Definition of Done

- `routes/api/healthz-smoke-bugfix3-287868165.ts` exists and default-exports a single
  `defineHandler` from `nitro/h3` taking no parameters, matching the contract above exactly.
- `GET /api/healthz-smoke-bugfix3-287868165` on a freshly started server responds with
  `Content-Type: application/json` and the body exactly `{"ok":true,"variant":"287868165"}` — no
  extra keys, `variant` a string not a number. The route table is built at scan time, so an
  already-running server must be restarted first.
- `routes/api/healthz-smoke-bugfix3-287868165.test.ts` exists, constructs an `H3Event` for the
  route's URL, and its single assertion — the handler resolves to
  `{ ok: true, variant: "287868165" }` — passes. It carries no elapsed-time assertion.
- The production build emits `.output/server/_routes/api/healthz_smoke_bugfix3_287868165.mjs`, and
  no `*.test.ts`-derived module appears under `.output/server/_routes/`.
- The diff adds exactly these two files and modifies zero existing files — nothing under
  `routes/api/` (other than the two additions), `middleware/`, `db/`, `src/`, any config file, or
  any root doc.

## 5. Ownership map

| File                                                 | Action |
| ---------------------------------------------------- | ------ |
| `routes/api/healthz-smoke-bugfix3-287868165.ts`      | create |
| `routes/api/healthz-smoke-bugfix3-287868165.test.ts` | create |

No other file is in scope. This map is disjoint from the other two defects in VRTX3-S-0020, so this
ticket needs no `depends_on` and can be built and merged in parallel with them.

## 6. Regression risk — low

Purely additive; no existing file is modified, so no current behaviour can change. Repo-wide grep
for `287868165` returns zero matches, so the new filename cannot shadow or be shadowed by an
existing route. No shared module, middleware interaction, schema change or migration is involved.
`e2e/smoke.spec.ts:27` probes `/api/hello`, not this family, so E2E impact is nil.
