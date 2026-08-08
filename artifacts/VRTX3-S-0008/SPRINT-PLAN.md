# Sprint Plan — VRTX3-S-0008 (Bugfix)

## Goal

Make three missing health-check endpoints serve their JSON contract. Each is an independent,
self-contained Nitro route file under `routes/api/` with its own H3Event integration test — no
auth, no database, no shared code, no existing file modified.

## Defect index

| Key          | Title                                                      | Root cause (one line)                                                                                                       | Plan                                           |
| ------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| VRTX3-T-0049 | `/api/healthz-smoke-bugfix-739648350` does not serve JSON  | Handler module `routes/api/healthz-smoke-bugfix-739648350.ts` was never written, so Nitro registers no route for the path.  | [VRTX3-T-0049/PLAN.md](./VRTX3-T-0049/PLAN.md) |
| VRTX3-T-0050 | `/api/healthz-smoke-bugfix2-901895284` does not serve JSON | Handler module `routes/api/healthz-smoke-bugfix2-901895284.ts` was never written, so Nitro registers no route for the path. | [VRTX3-T-0050/PLAN.md](./VRTX3-T-0050/PLAN.md) |
| VRTX3-T-0051 | `/api/healthz-smoke-bugfix3-221117839` does not serve JSON | Handler module `routes/api/healthz-smoke-bugfix3-221117839.ts` was never written, so Nitro registers no route for the path. | [VRTX3-T-0051/PLAN.md](./VRTX3-T-0051/PLAN.md) |

RCA detail, steps, contracts, DoD and test plan live in each PLAN.md above — not here.

## Cross-cutting notes for engineers

1. **The "404" in all three tickets is factually wrong — do not write a status-code test.**
   Re-measured live on `bun run dev` for this sprint (2026-08-08): each of the three missing paths
   returned **`200` with `Content-Type: text/html`** (the SPA `index.html` shell), not `404`. The
   working control `/api/healthz-smoke-bugfix3-605591646` returned
   `200 application/json;charset=UTF-8` with `{"ok":true,"variant":"605591646"}`. An
   `expect(status).toBe(200)` check therefore passes whether or not the route exists.
   **Assert on the response body and `Content-Type`.** Third sprint with this misdiagnosis —
   already recorded in AGENT.md by VRTX3-S-0001 and VRTX3-S-0007.

2. **No shared files, no ordering, no `depends_on`.** Each defect creates exactly two brand-new
   files (`<name>.ts` + `<name>.test.ts`) and modifies nothing. Ownership maps are disjoint, so
   all three run fully in parallel. Do not introduce a shared helper, constant, or factory —
   independence is part of the contract.

3. **Pattern to copy:** `routes/api/healthz-smoke-bugfix3-605591646.ts` (handler) and
   `routes/api/healthz-smoke-bugfix3-605591646.test.ts` (test). `defineHandler` from `nitro/h3`,
   default export, returns the literal object; the test constructs a real `H3Event` from a
   `Request` and deep-equals the result.

4. **`variant` is a string**, not a number — `"739648350"`, `"901895284"`, `"221117839"`. Mind the
   `bugfix` / `bugfix2` / `bugfix3` prefixes; the filename _is_ the route, and a typo yields a
   silent `200 text/html` rather than an error.

5. **Method-agnostic is correct.** Verified against the control: `POST`/`PUT`/`DELETE` return the
   same `200` JSON body, no 500. Do not add a method guard.

6. **Gate:** `bun run verify` (lint zero-warning + typecheck + Vitest). No `db:generate`, no
   migration, no Playwright spec — server-only routes with no UI surface.

## Root docs

Observable behavior changes (three endpoints go from SPA-fallback HTML to real JSON), so
`AGENT.md` gets a dated changelog entry — **already written as part of this planning ticket**,
following the VRTX3-S-0007 precedent; engineers do not need to touch it. It also records two
details measured this sprint that were previously assumed: the handlers are method-agnostic, and
`bun run build` maps a route to `.output/server/_routes/api/<name_with_underscores>.mjs`.
`PRODUCT.md`, `ARCHITECTURE.md` and `DESIGN.md` are untouched: no new product capability, no
architectural decision, no UI.

## Risks & assumptions

- **Risk — false-green verification.** The dominant risk in this sprint: a status-code-only test
  passes before the fix exists. Mitigated by the body + `Content-Type` assertion in every DoD.
- **Risk — accidental coupling.** Factoring the three near-identical handlers into a shared
  helper would violate the independence contract and couple three otherwise-parallel tickets.
  Explicitly out of scope.
- **Assumption — the routing config is sound. Verified:** `vite.config.ts` sets
  `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, ~40 sibling endpoints work today, and
  `bun run build` on this branch exited 0 and emitted
  `.output/server/_routes/api/healthz_smoke_bugfix3_605591646.mjs`. No config change is needed or
  wanted.

## Follow-ups / out of scope

- **Defect-report template produces unverifiable repro steps.** Every ticket in this sprint (and
  in VRTX3-S-0001/0002/0003/0007) asserts "returns 404" for a missing `/api/*` path, which this
  codebase never does. The repro step `curl <path> — observe 404` cannot reproduce anything, so
  the tickets are not independently verifiable as written. This is a distinct process/tooling
  defect not covered by any committed ticket here; product has no DEFECT-creation authority, so
  it is left for a future sprint to fix the defect-capture template (require body +
  `Content-Type` evidence for API-route defects). Carried forward unresolved from VRTX3-S-0007.
- **No negative-path coverage for the SPA-fallback-shadows-API behavior.** There is still no test
  anywhere asserting that an unknown `/api/*` path is _not_ JSON, so a future route deletion or
  rename would go silently undetected. Out of scope for this bugfix sprint. Carried forward
  unresolved from VRTX3-S-0007.
- **`routes/api/` is accumulating ~40 near-identical throwaway smoke endpoints** (79 files), none
  of which are referenced by `src/`. No committed ticket covers pruning them, and deleting any is
  out of scope for a bugfix sprint, but the directory is becoming noise that makes a genuinely
  missing route harder to spot by inspection.
