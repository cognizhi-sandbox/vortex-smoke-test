# Product

**vortex-smoke-test-bootstrap** — A working template demonstrating the Vortex infrastructure stack: React + TypeScript + Nitro full-stack with file-based routing, SQLite persistence, and a complete test harness (unit, component, E2E, smoke).

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how it's built, [DESIGN.md](./DESIGN.md) for the visual system, and [AGENT.md](./AGENT.md) for the operating manual.

## Problem

Teams building full-stack TypeScript applications spend significant time scaffolding infrastructure before writing product code — toolchain setup, build configuration, test harness, dev/prod parity, deployment. This template eliminates that friction.

## Users

- **Vortex engineers** — prove the boilerplate works end-to-end before feature sprints
- **Early adopters** — bootstrap new full-stack projects on a known-good foundation
- **Future product teams** — extend this template with domain features

## Scope

### Included

- **Frontend**: React 19 SPA with file-based routing, auto-imports for hooks/components, TypeScript strict mode
- **Backend**: Nitro 3 server with file-based API routes, SQLite persistence via Drizzle ORM, middleware support
- **Health probes**: a growing family of `/api/healthz-smoke-*` GET endpoints, each returning `{ ok: true, variant: "<id>" }`. Each is self-contained — no auth, no database, no code shared with any sibling — so it proves two things at once: that the deployed build is actually serving the Nitro API, and that independent units of work can be picked up, built and merged in parallel without conflicting
- **Testing**: Vitest + React Testing Library (unit/component/API integration tests), Playwright for E2E and smoke tests — all working examples, all scripts in `package.json`
- **Styling**: Tailwind CSS v4 (CSS-first, no config files), shadcn/ui-style component primitives, custom design tokens
- **DevEx**: ESLint 10 + typescript-eslint, Prettier, Husky pre-commit hooks, hot module reload, sourcemaps
- **Deployment**: Bun-based production server (`.output/server/index.mjs`), Docker/docker-compose for containerization
- **CI/CD**: GitHub Actions workflow triggering on `vortex/**` branches

### Not in Scope

- Real authentication (stub middleware exists; swap with real auth before shipping)
- Domains features or business logic (boilerplate only)
- Component library beyond shadcn-style primitives
- Custom visualization/charting framework
- Mobile-specific optimization

## Features

### Health probe endpoints (`/api/healthz-smoke-*`)

**User stories**

- As a **sprint owner**, I want small independent GET endpoints added without a planning cycle, so low-risk additive work is not queued behind process overhead.
- As an **operator of the build pipeline**, I want each probe to return its own `{ ok: true, variant: "<id>" }`, so I have an independent check that the deployed build is serving the Nitro API.
- As an **engineer picking up one probe**, I want it to share no code with its siblings, so I can build, test and merge it without waiting on or conflicting with anyone else.

**Acceptance criteria** (per probe)

- `GET /api/<probe-name>` responds with HTTP 200, `Content-Type: application/json`, and a body deep-equal to `{ "ok": true, "variant": "<id>" }` — `variant` is a string, not a number.
- The probe is a single file under `routes/api/`, with a colocated `<probe-name>.test.ts` asserting on the handler's returned object.
- The probe imports nothing from `db/`, reads nothing from `event.context`, and imports no sibling probe. No shared helper, factory, constants file or barrel export is introduced for it.
- Adding a probe modifies no existing route, page, middleware, schema or migration — the diff is new files only.

**Current probes:** 65 across the family, the most recent being the `238855431` set (`healthz-smoke-238855431-a`, `-b`, `-c`) added in VRTX3-S-0017.

**Deliberately not covered:** authentication or authorization on probes, non-`GET` method handling, request params or bodies, observability wiring, Playwright/E2E coverage, and retirement of older probes. See [ARCHITECTURE.md](./ARCHITECTURE.md#key-decisions) for why the duplication between probes is kept.

## Success Criteria

✅ Application builds and runs locally from a clean checkout  
✅ Home page renders and shows the project name  
✅ Type-check, lint, and unit tests pass  
✅ End-to-end smoke test passes against the running app  
✅ CI is green on the sprint branch (typecheck, lint, test, build all pass)

---

## Changelog

### 2026-08-10 — Sprint VRTX3-S-0017: Three Independent Health Check Endpoints (238855431)

Added `/api/healthz-smoke-238855431-a`, `-b` and `-c`, each returning `{ok:true,variant:"238855431"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 62 → 65, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The deliverable users actually care about is the second-order one: the three tasks carry disjoint file-ownership maps and no `depends_on` edge, so they prove again that independent leaf work needs no coordination.

### 2026-08-10 — Sprint VRTX3-S-0016: Three Independent Health Check Endpoints (756246354)

Added `/api/healthz-smoke-756246354-a`, `-b` and `-c`, each returning `{ok:true,variant:"756246354"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 59 → 62, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The deliverable users actually care about is the second-order one: the three tasks carry disjoint file-ownership maps and no `depends_on` edge, so they prove again that independent leaf work needs no coordination.

### 2026-08-10 — Sprint VRTX3-S-0015: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-406186407`, `/api/healthz-smoke-bugfix2-487405332` and `/api/healthz-smoke-bugfix3-418626414`, each returning `{ok:true,variant:"<id>"}`. Purely additive: 6 new files, 0 modified. Probe count 56 → 59. Scope and per-probe acceptance criteria are unchanged; only the count and the most-recent-set pointer moved.

All three were reported as returning `404`; re-measured during planning against a live dev server, all three returned `200 text/html` (the SPA shell) instead — the seventh sprint in a row to find this. The defects were real, the status codes were not — see [AGENT.md § Gotchas](./AGENT.md#gotchas).

### 2026-08-10 — Sprint VRTX3-S-0014: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-174694844`, `/api/healthz-smoke-bugfix2-754372119` and `/api/healthz-smoke-bugfix3-404580234`, each returning `{ok:true,variant:"<id>"}`. Purely additive: 6 new files, 0 modified. Probe count 53 → 56. Scope and per-probe acceptance criteria are unchanged; only the count and the most-recent-set pointer moved.

All three were reported as returning `404`; re-measured during planning, all three returned `200 text/html` (the SPA shell) instead. The defects were real, the status codes were not — see [AGENT.md § Gotchas](./AGENT.md#gotchas).

### 2026-08-09 — Sprint VRTX3-S-0013: Three Independent Health Check Endpoints (841017405)

Added `/api/healthz-smoke-841017405-a`, `-b` and `-c`, each returning `{ok:true,variant:"841017405"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified, no new dependency, nothing in `src/`. Probe count 50 → 53, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The deliverable users actually care about is the second-order one: the three tasks carry disjoint file-ownership maps, so they prove again that independent leaf work needs no coordination.

### 2026-08-09 — Sprint VRTX3-S-0012: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-6202295`, `/api/healthz-smoke-bugfix2-433928318` and `/api/healthz-smoke-bugfix3-196651982`, each returning `{ok:true,variant:"<id>"}`. Purely additive: 6 new files, 0 modified. Probe count 47 → 50. Scope and per-probe acceptance criteria are unchanged; only the count and the most-recent set moved.

### 2026-08-09 — Sprint VRTX3-S-0011: Three Independent Health Check Endpoints (528856326)

Added `/api/healthz-smoke-528856326-a`, `-b` and `-c`, each returning `{ok:true,variant:"528856326"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified, no new dependency, nothing in `src/`.

The probe family is now described once, as a first-class product feature with its own user stories and per-probe acceptance criteria, in the new [Features](#features) section — previous sprints only recorded it here in the changelog. Also corrected: DevEx lint is ESLint 10, not ESLint 9.

### 2026-08-05 — Sprint VRTX3-S-0006: Three Independent Health Check Endpoints

Added three completely independent health-check endpoints (`/api/healthz-smoke-913793173-a`, `/api/healthz-smoke-913793173-b`, `/api/healthz-smoke-913793173-c`), each returning `{ok:true,variant:"913793173"}`. Demonstrates parallel endpoint development pattern with zero interdependencies and no shared code. Each endpoint is self-contained with integration tests using H3Event pattern. Reference implementation for adding multiple endpoints without coordination overhead.

### 2026-08-02 — Sprint VRTX3-S-0004: Three Independent Health Check Endpoints

Added three independent health check endpoints (`/api/healthz-smoke-680958919-a`, `/api/healthz-smoke-680958919-b`, `/api/healthz-smoke-680958919-c`), each returning `{ok:true,variant:"680958919"}`. Demonstrates parallel endpoint development pattern with no shared code between endpoints. Each self-contained, no auth/database dependencies. Includes comprehensive integration tests and full CI validation. Reference implementation for adding multiple endpoints without overhead.

### 2026-07-26 — Sprint SPRINT-0019: Three Independent Health Check Endpoints

Added three independent health check endpoints (`/api/healthz-smoke-302960562-a`, `/api/healthz-smoke-302960562-b`, `/api/healthz-smoke-302960562-c`), each returning `{ok:true, variant:"302960562"}`. Demonstrates parallel endpoint development pattern with no shared code between endpoints. Each self-contained, no auth/database dependencies. Includes comprehensive integration tests and full CI validation. Reference implementation for adding multiple endpoints without overhead.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

Added `/healthz-smoke-cancel-569985850` GET endpoint returning `{ok:true, variant:"569985850"}`. Self-contained, no auth/database, simple health check for smoke testing. Third example of minimal health check pattern.

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` GET endpoint returning `{ok:true, variant:"158110053"}`. Self-contained, no auth/database, simple health check for smoke testing. Second example of minimal health check pattern.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` GET endpoint returning `{ok:true, variant:"407995880"}`. Self-contained, no auth/database, simple health check for smoke testing.

### 2026-07-26 — Bootstrap sprint

Initial project setup from the vortex-boilerplate-ts-reactjs-vite-tailwindcss template. Renamed project to vortex-smoke-test-bootstrap, updated homepage, added GitHub Actions CI workflow, documented root specs (AGENT/PRODUCT/ARCHITECTURE/DESIGN). Stack: React 19, Vite 8, Nitro 3, SQLite + Drizzle, Tailwind CSS v4, Vitest + Playwright.
