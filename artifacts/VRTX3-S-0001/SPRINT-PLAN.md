# VRTX3-S-0001 — Bugfix Sprint Plan (INDEX)

**Sprint goal**: `smoke-bugfix-1785889878831367` — restore three missing
`/api/healthz-smoke-*` endpoints so each returns its `{ok, variant}` JSON.

**Planned**: 2026-08-05 · base `94f7504` · Idea `VRTX3-I-0001`
**Regression risk**: Low — three additive files + tests; nothing existing is modified.

This file is an **index**. The RCA, fix, interface contract and Definition of
Done for each defect live only in that defect's `PLAN.md`.

---

## Defects

| Ticket       | Endpoint                               | One-sentence root cause                                                                                                                         | Plan                                             |
| ------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| VRTX3-T-0001 | `/api/healthz-smoke-bugfix-868175391`  | The handler file `routes/api/healthz-smoke-bugfix-868175391.ts` was never added, and Nitro registers `/api/*` routes solely from files on disk. | [`VRTX3-T-0001/PLAN.md`](./VRTX3-T-0001/PLAN.md) |
| VRTX3-T-0002 | `/api/healthz-smoke-bugfix2-101584827` | The handler file `routes/api/healthz-smoke-bugfix2-101584827.ts` was never added, so no route is registered for the path.                       | [`VRTX3-T-0002/PLAN.md`](./VRTX3-T-0002/PLAN.md) |
| VRTX3-T-0003 | `/api/healthz-smoke-bugfix3-403022997` | The handler file `routes/api/healthz-smoke-bugfix3-403022997.ts` was never added, so no route is registered for the path.                       | [`VRTX3-T-0003/PLAN.md`](./VRTX3-T-0003/PLAN.md) |

---

## Cross-cutting notes for engineers

1. **⚠ The reported symptom "returns 404" is wrong — do not verify against it.**
   Reproduced on `94f7504` in **both** `bun run dev` (Vite :5000) and the
   production build (`bun .output/server/index.mjs`): an unmatched `/api/*` path
   returns **`200` with `Content-Type: text/html`** — the SPA `index.html`
   shell — not a 404. Behind `nginx.conf` the `/api/` location proxies straight
   to Nitro with `proxy_intercept_errors` off, so nginx does not change this.
   Consequence: **the status code is `200` before and after the fix**, so any
   check of the form "was 404, now 200" passes vacuously. Assert on the
   **response body and `Content-Type: application/json`**. This correction
   supersedes the ticket descriptions and the `VRTX3-I-0001` canvas (including
   its Fix-AC #1 and its Mermaid `404 Not Found` node).

2. **No shared files; no ordering constraints.** Each fix creates two brand-new
   files under `routes/api/` and modifies nothing else — not `vite.config.ts`,
   not `middleware/`, not `db/`. No `depends_on` chain is warranted; the three
   tickets are fully parallelisable. If an engineer finds themselves editing a
   shared file, the plan has been misread.

3. **Follow the existing convention, do not refactor.** `routes/api/` holds ~30
   near-identical self-contained healthz handlers. Copy the nearest sibling
   verbatim. Do **not** extract a shared or parameterised healthz helper — that
   would turn three low-risk additive fixes into a 30-file refactor.

4. **Keep handlers context-free.** `middleware/auth.ts` runs before every route
   and sets `event.context.user`. The healthz siblings deliberately never read
   it; the new handlers must not either.

5. **Gate**: `bun run verify` (lint + typecheck + test). Each new `.test.ts`
   under `routes/api/` is picked up automatically by Vitest's `server` project
   and excluded from the production bundle by `nitro({ ignore: ["**/*.test.ts"] })`.

6. **Stale artifacts removed.** This directory previously held planning and
   execution artifacts from an earlier sprint that reused the key `VRTX3-S-0001`
   (goal `smoke-bugfix-178564451025463`, variants `508914715` / `473664326` /
   `429794134` — all three already shipped and present in `routes/api/`). Those
   files described different endpoints under these same ticket keys and were
   deleted in this commit to prevent engineers implementing the wrong variants.
   They remain in git history at `a976259`.

---

## Docs impact

None. Observable behaviour changes only by adding three endpoints that follow an
already-documented pattern; `AGENT.md` / `PRODUCT.md` / `ARCHITECTURE.md` /
`DESIGN.md` need no edit at planning time. The `AGENT.md` changelog entry for
this sprint belongs to sprint close, not to planning.

---

## Follow-ups / out of scope

- **Unmatched `/api/*` paths return `200 text/html` instead of a JSON 404.**
  Distinct from the three committed defects (which are missing files) — this is
  a router/fallback-precedence issue affecting _every_ mistyped or missing API
  path. It silently converts "endpoint does not exist" into "endpoint returned
  an unparseable body", which is what made the original 404 reports inaccurate,
  and it defeats any smoke test that probes for a 404. Suggested fix for a later
  sprint: register an `/api/**` catch-all that returns a real `404` JSON error so
  the SPA fallback never claims API paths. **Not filed as a ticket** — product
  has no DEFECT-creation authority.
- **~30 duplicated healthz handlers in `routes/api/`.** A parameterised route
  (e.g. `routes/api/healthz/[variant].ts`) would collapse them, but this is a
  refactor, not a defect, and must not ride along with a bugfix sprint.
