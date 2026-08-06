# Sprint Plan — VRTX3-S-0007 (Bugfix)

## Goal

Make three missing health-check endpoints serve their JSON contract. Each is an independent,
self-contained Nitro route file under `routes/api/` with its own H3Event integration test — no
auth, no database, no shared code, no existing file modified.

## Defect index

| Key          | Title                                                      | Root cause (one line)                                                                                                       | Plan                                           |
| ------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| VRTX3-T-0043 | `/api/healthz-smoke-bugfix-534542341` does not serve JSON  | Handler module `routes/api/healthz-smoke-bugfix-534542341.ts` was never written, so Nitro registers no route for the path.  | [VRTX3-T-0043/PLAN.md](./VRTX3-T-0043/PLAN.md) |
| VRTX3-T-0044 | `/api/healthz-smoke-bugfix2-279986033` does not serve JSON | Handler module `routes/api/healthz-smoke-bugfix2-279986033.ts` was never written, so Nitro registers no route for the path. | [VRTX3-T-0044/PLAN.md](./VRTX3-T-0044/PLAN.md) |
| VRTX3-T-0045 | `/api/healthz-smoke-bugfix3-605591646` does not serve JSON | Handler module `routes/api/healthz-smoke-bugfix3-605591646.ts` was never written, so Nitro registers no route for the path. | [VRTX3-T-0045/PLAN.md](./VRTX3-T-0045/PLAN.md) |

RCA detail, steps, contracts, DoD and test plan live in each PLAN.md above — not here.

## Cross-cutting notes for engineers

1. **The "404" in all three tickets is factually wrong — do not write a status-code test.**
   Reproduced live on `bun run dev`: each missing path returns **`200` with
   `Content-Type: text/html`** (the SPA `index.html` fallback), not `404`. The working control
   (`/api/healthz-smoke-bugfix3-764107669`) returns `200 application/json;charset=UTF-8` with
   `{"ok":true,"variant":"764107669"}`. A `expect(status).toBe(200)` check therefore passes
   whether or not the route exists. **Assert on the response body and `Content-Type`.** This
   matches the gotcha already recorded in AGENT.md by sprint VRTX3-S-0001.

2. **No shared files, no ordering, no `depends_on`.** Each defect creates exactly two brand-new
   files (`<name>.ts` + `<name>.test.ts`) and modifies nothing. Ownership maps are disjoint, so
   all three run fully in parallel. Do not introduce a shared helper, constant, or factory —
   independence is part of the contract.

3. **Pattern to copy:** `routes/api/healthz-smoke-bugfix3-764107669.ts` (handler) and
   `routes/api/healthz-smoke-bugfix3-764107669.test.ts` (test). `defineHandler` from `nitro/h3`,
   default export, returns the literal object; test constructs a real `H3Event` from a `Request`
   and deep-equals the result.

4. **`variant` is a string**, not a number — `"534542341"`, `"279986033"`, `"605591646"`.

5. **Gate:** `bun run verify` (lint zero-warning + typecheck + Vitest). No `db:generate`, no
   migration, no Playwright spec — these are server-only routes with no UI surface.

## Root docs

Observable behavior changes (three endpoints go from SPA-fallback HTML to real JSON), so
`AGENT.md` gets a dated changelog entry. `PRODUCT.md`, `ARCHITECTURE.md` and `DESIGN.md` are
untouched: no new product capability, no architectural decision, no UI.

## Risks & assumptions

- **Risk — false-green verification.** The dominant risk in this sprint: a status-code-only test
  passes before the fix exists. Mitigated by the body+`Content-Type` assertion in every DoD.
- **Risk — accidental coupling.** An engineer factoring the three near-identical handlers into a
  shared helper would violate the independence contract and couple three otherwise-parallel
  tickets. Explicitly out of scope.
- **Assumption — the routing config is sound.** Verified: `vite.config.ts:29` sets
  `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })` and 40+ sibling endpoints work today. No
  config change is needed or wanted.

## Follow-ups / out of scope

- **Defect-report template produces unverifiable repro steps.** Every ticket in this sprint (and
  in VRTX3-S-0001/0002/0003) asserts "returns 404" for a missing `/api/*` path, which this
  codebase never does. The repro step `curl <path> — observe 404` cannot reproduce anything, so
  the tickets are not independently verifiable as written. A distinct process/tooling defect, not
  covered by any committed ticket here; product has no DEFECT-creation authority, so it is left
  for a future sprint to fix the defect-capture template (require body + `Content-Type` evidence
  for API-route defects).
- **No negative-path coverage for the SPA-fallback-shadows-API behavior.** There is no test
  anywhere asserting that an unknown `/api/*` path is _not_ JSON, so a future route deletion or
  rename would go silently undetected. Out of scope for this bugfix sprint.
