# Product

**vortex-smoke-test-bootstrap** — A working template demonstrating the Vortex infrastructure stack: React + TypeScript + Nitro full-stack with file-based routing, SQLite persistence, and a complete test harness (unit, component, E2E, smoke).

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how it's built, [DESIGN.md](./DESIGN.md) for the visual system, and [AGENTS.md](./AGENTS.md) for the operating manual.

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

**How many exist:** the family grows by a few probes most sprints and none are retired, so this document deliberately carries no count and no "most recent" pointer — both are claims that would be stale the sprint after they were written. The live inventory is `routes/api/healthz-smoke-*.ts`; the contract each probe satisfies is written down per probe in [`openspec/specs/health-probes/`](./openspec/specs/health-probes/spec.md).

**Deliberately not covered:** authentication or authorization on probes, non-`GET` method handling, request params or bodies, observability wiring, Playwright/E2E coverage, and retirement of older probes. See [ARCHITECTURE.md](./ARCHITECTURE.md#key-decisions) for why the duplication between probes is kept.

## Success Criteria

✅ Application builds and runs locally from a clean checkout  
✅ Home page renders and shows the project name  
✅ Type-check, lint, and unit tests pass  
✅ End-to-end smoke test passes against the running app  
✅ CI is green on the sprint branch (typecheck, lint, test, build all pass)

---

## Changelog

### 2026-08-25 — Sprint VRTX3-S-0039: Three Independent Health Check Endpoints (812788042)

Added `/api/healthz-smoke-812788042-a`, `-b` and `-c`, each returning `{ok:true,variant:"812788042"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 121 → 124, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope, the feature definition, its user stories and the per-probe acceptance criteria are unchanged. This is the second spec-driven sprint, and the first in which the `health-probes` capability was extended rather than created: the change adds three requirements to the existing spec of record and restates none of the 121 already there. For a product feature that ships three instances a sprint, that is the property worth having — the cost of writing the contract down does not grow with the number of instances already shipped.

One conversion recorded against the idea rather than the criteria: VRTX3-I-0048's AC-8 names a verification script and its three constituent tools. What it reaches for — the new tests run in the existing suite with no new lint warning or type error — is already covered above as observable outcomes, so the outcome is carried and the command names are not.

### 2026-08-25 — Sprint VRTX3-S-0038: Three Independent Health Check Endpoints (992401223)

Added `/api/healthz-smoke-992401223-a`, `-b` and `-c`, each returning `{ok:true,variant:"992401223"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 118 → 121, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope, the feature definition, its user stories and the per-probe acceptance criteria are unchanged. What changed is where the contract is written down, and it is worth stating as a product fact rather than a process note. This is the first sprint in which the probe behaviour is specified as a versioned requirement — an OpenSpec `health-probes` capability with RFC-2119 requirements and GIVEN/WHEN/THEN scenarios — instead of only as the criteria in this section. The family has shipped 118 times against criteria that lived here and nowhere machine-checkable; each ticket criterion now derives from a named scenario, so a QA verdict points at a requirement rather than at a paragraph. The criteria above stay as the product-level statement and did not need rewording to be derivable, which is the useful confirmation.

One conversion recorded against the idea rather than the criteria: VRTX3-I-0047's AC-8 names two commands (a verification script and a build). What it reaches for — the new tests run in the existing suite, and the production server carries the three routes — is already covered above as observable outcomes, so the outcome is carried and the command names are not.

### 2026-08-23 — Sprint VRTX3-S-0037: Three Missing Health Probes Restored (bugfix 147016547 / 386341015 / 1025161533)

Restored `/api/healthz-smoke-bugfix-147016547`, `/api/healthz-smoke-bugfix2-386341015` and `/api/healthz-smoke-bugfix3-1025161533`, each returning `{ok:true,variant:"<id>"}` — three separate leaf units of work with no shared code, built and merged in parallel. All three were reported as returning `404`; measurement showed each answering the SPA shell instead, which is the documented behaviour for an unrouted `/api/*` path and does not change what the fix is. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 115 → 118, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope, the feature definition, its user stories and the per-probe acceptance criteria are unchanged. Two conversions recorded against the idea rather than the criteria. VRTX3-I-0044's AC-5 and AC-6 name verification and build commands; what they reach for — the new tests run in the existing suite, and the production server carries the route — is already covered above as observable outcomes, so the outcome is carried and the command names are not. Its AC-8 assigns the probe-count doc update to the fix work; that register is planning-owned and was updated in the same planning pass, so no fix ticket carries it.

### 2026-08-23 — Sprint VRTX3-S-0036: Three Independent Health Check Endpoints (450228657)

Added `/api/healthz-smoke-450228657-a`, `-b` and `-c`, each returning `{ok:true,variant:"450228657"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 112 → 115, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope, the feature definition, its user stories and the per-probe acceptance criteria are unchanged. One conversion recorded against the idea rather than the criteria: VRTX3-I-0043's AC-7 asks that a named verification script pass. What that criterion is reaching for — each new probe's test runs in the existing suite, and the production server actually carries the route — is already covered by the per-probe criteria above as observable outcomes. Which script produces them is a matter for whoever implements, not a product claim, so the outcome is carried and the script name is not.

This is the second consecutive sprint whose idea declines documentation work on the grounds that probes are throwaway — VRTX3-I-0043 puts an "OpenAPI/docs entry" out of scope. The endpoints are disposable; the count of them is a claim this document makes to its readers, so it is re-derived from the filesystem every sprint rather than incremented, and `README.md` — which carries no probe count — stays untouched.

### 2026-08-23 — Sprint VRTX3-S-0035: Three Independent Health Check Endpoints (180848429)

Added `/api/healthz-smoke-180848429-a`, `-b` and `-c`, each returning `{ok:true,variant:"180848429"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 109 → 112, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope, the feature definition, its user stories and the per-probe acceptance criteria are unchanged. Two corrections recorded against the idea rather than the criteria.

VRTX3-I-0042 lists `README.md` among the documents to leave alone on the grounds that it carries probe-family information. It carries none — this is the second consecutive sprint whose idea has assumed it does. The count lives in `AGENTS.md`, `ARCHITECTURE.md` and this document, all planning-owned, so no implementation ticket carried a documentation change and `README.md` was untouched either way.

The same idea puts documentation updates out of scope entirely, reasoning that "these are throwaway probe endpoints". That reasoning is sound about the endpoints and does not transfer to the count of them. For anyone consuming this document the distinction is the product point: an individual probe is disposable by design, but "how many probes exist, and which are newest" is a claim this document makes to its readers, and a claim that quietly drifts out of date is a defect regardless of how cheap the thing being counted is. The count is re-derived from the filesystem every sprint for that reason, not incremented.

### 2026-08-23 — Sprint VRTX3-S-0034 (`smoke-bugfix-178747715613700`): Three Missing Health Probes

Restored three probes that were reported as unreachable: `/api/healthz-smoke-bugfix-839771954`, `/api/healthz-smoke-bugfix2-554747562` and `/api/healthz-smoke-bugfix3-238311955`, each returning `{ok:true,variant:"<id>"}`. Purely additive — 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 106 → 109, and the "most recent set" pointer under [Features](#features) moves to this trio.

The defect was real in all three cases and, for the third sprint running, not the one reported: each was described as returning `404`, and each measured live during planning as the SPA HTML shell with `200`. The probe contract under [Features](#features) is stated as body plus `Content-Type` for exactly this reason, and stays that way.

One correction recorded against the per-probe acceptance criteria rather than changing them. The idea behind one of the three asked for a "sub-100ms response" assertion inside the companion unit test. That is not a product criterion and is not carried here — a probe's guarantee is the response contract (`200`, `application/json`, the exact body) plus the structural promise that it touches no auth, database or sibling module. Latency follows from that structure; a wall-clock check on a shared CI runner measures the runner. This is the second time an idea has asked for it (VRTX3-S-0017 was the first) and the answer is unchanged.

Also repaired: the `AGENT.md` → `AGENTS.md` rename in `600b74f` left three dead cross-references in this document. Paths only; no prose changed.

### 2026-08-21 — Sprint VRTX3-S-0003 (`smoke-bugfix-17873270732264355`): Three Missing Health Probes

Restored three probes that were reported as unreachable: `/api/healthz-smoke-bugfix-858873211`, `/api/healthz-smoke-bugfix2-664793322` and `/api/healthz-smoke-bugfix3-267063007`, each returning `{ok:true,variant:"<id>"}`. Purely additive — 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 103 → 106, and the "most recent set" pointer under [Features](#features) moves to this trio.

The defect was real in all three cases and, for the second sprint running, not the one reported. Each was described as returning `404`; measured live during planning, each returned the SPA HTML shell with `200`. What is new this time is where the wrong claim came from: the idea behind one of the three is unusually well-evidenced — it locates the missing file, greps for the variant id, quotes a working sibling in full — and still carries the wrong status code. For anyone consuming these probes that is the product requirement restated: a health check asserting only on status code passes against an endpoint that does not exist, and no amount of care in the bug report changes that. The probe contract under [Features](#features) is stated as body plus `Content-Type`, and stays that way.

### 2026-08-21 — Sprint VRTX3-S-0002 (`smoke-bugfix-17873246012078034`): Three Missing Health Probes

Restored three probes that were reported as unreachable: `/api/healthz-smoke-bugfix-158202122`, `/api/healthz-smoke-bugfix2-142310404` and `/api/healthz-smoke-bugfix3-834560860`, each returning `{ok:true,variant:"<id>"}`. Purely additive — 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 100 → 103, and the "most recent set" pointer under [Features](#features) moves to this trio.

The user-visible defect was real in all three cases, but not the one reported. Each was described as returning `404`; measured live during planning, each returned the SPA HTML shell with `200`. For anyone consuming these probes that distinction is the whole product requirement: a health check that asserts only on status code passes against an endpoint that does not exist. The probe contract under [Features](#features) is therefore stated as body plus `Content-Type`, and stays that way.

### 2026-08-20 — Sprint VRTX3-S-0033: Three Independent Health Check Endpoints (189360772)

Added `/api/healthz-smoke-189360772-a`, `-b` and `-c`, each returning `{ok:true,variant:"189360772"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 97 → 100, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope, the feature definition, its user stories and the per-probe acceptance criteria are unchanged. One correction recorded against the idea rather than the criteria: VRTX3-I-0040 lists `README.md` among the files carrying the probe-family count. It does not carry one — the count lives in `AGENT.md`, `ARCHITECTURE.md` and this document, all of them planning-owned, so no implementation ticket carried a documentation change and `README.md` was left untouched.

### 2026-08-20 — Sprint VRTX3-S-0030: Bugfix Sprint – Two Missing Health Probes (`-ha` family)

Added `/api/healthz-smoke-bugfix-ha-853006542` and `/api/healthz-smoke-bugfix-ha2-165600260`, each returning `{ok:true,variant:"<id>"}`. Purely additive: 4 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 95 → 97, and the "most recent set" pointer under [Features](#features) moves to this pair.

Scope and the per-probe acceptance criteria are unchanged. One clarification recorded against them: both defect reports named their endpoint without the `/api/` prefix. The criteria say `GET /api/<probe-name>` and that remains the product contract — a probe is reachable at `/api/…` and nowhere else, which was re-confirmed by measurement during planning against a probe that already exists.

### 2026-08-20 — Sprint VRTX3-S-0028: Three Independent Health Check Endpoints (458730798)

Added `/api/healthz-smoke-458730798-a`, `-b` and `-c`, each returning `{ok:true,variant:"458730798"}`. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 92 → 95, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope and the per-probe acceptance criteria are unchanged. Non-`GET` method handling stays deliberately out of scope, as it has been since the family was introduced — these handlers answer every verb with the same body by design.

One correction worth recording against the per-probe acceptance criteria: the idea behind this sprint asked for a per-handler "returns in under 100 ms" assertion inside each unit test. That is not a product criterion and it is not carried here — the probes' guarantee is the response contract (`200`, `application/json`, the exact body) plus the structural promise that a probe touches no auth, database or sibling module. Response latency follows from that structure rather than being asserted with a wall-clock check on a shared CI runner.

### 2026-08-19 — Sprint VRTX3-S-0027: Three Independent Health Check Endpoints (868033827)

Added `/api/healthz-smoke-868033827-a`, `-b` and `-c`, each returning `{ok:true,variant:"868033827"}`. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 89 → 92, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope and the per-probe acceptance criteria are unchanged. Non-`GET` method handling stays deliberately out of scope, as it has been since the family was introduced — these handlers answer every verb with the same body by design.

### 2026-08-19 — Sprint VRTX3-S-0026: Three Independent Health Check Endpoints (888240601)

Added `/api/healthz-smoke-888240601-a`, `-b` and `-c`, each returning `{ok:true,variant:"888240601"}`. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 86 → 89, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope and the per-probe acceptance criteria are unchanged. Non-`GET` method handling stays deliberately out of scope, as it has been since the family was introduced — these handlers answer every verb with the same body by design.

### 2026-08-16 — Sprint VRTX3-S-0024: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-27681476`, `/api/healthz-smoke-bugfix2-107364458` and `/api/healthz-smoke-bugfix3-351014898`, each returning `{ok:true,variant:"<id>"}`. All three were reported as missing; each was a never-written route file rather than a broken one, so the fix is purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 83 → 86, and the "most recent set" pointer under [Features](#features) moves to this trio.

Scope and the per-probe acceptance criteria are unchanged. Non-`GET` method handling stays deliberately out of scope, as it has been since the family was introduced — these handlers answer every verb with the same body by design.

### 2026-08-14 — Sprint VRTX3-S-0023: Three Independent Health Check Endpoints (1065915107)

Added `/api/healthz-smoke-1065915107-a`, `-b` and `-c`, each returning `{ok:true,variant:"1065915107"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 80 → 83, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The user-visible deliverable is three URLs; the deliverable the sprint exists to prove is the second-order one, that three tickets with disjoint file-ownership maps and no `depends_on` edge need no coordination to land.

### 2026-08-11 — Sprint VRTX3-S-0022: Three Independent Health Check Endpoints (600965021)

Added `/api/healthz-smoke-600965021-a`, `-b` and `-c`, each returning `{ok:true,variant:"600965021"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 77 → 80, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The user-visible deliverable is three URLs; the deliverable the sprint exists to prove is the second-order one, that three tickets with disjoint file-ownership maps and no `depends_on` edge need no coordination to land.

### 2026-08-11 — Sprint VRTX3-S-0021: Three Independent Health Check Endpoints (568557289)

Added `/api/healthz-smoke-568557289-a`, `-b` and `-c`, each returning `{ok:true,variant:"568557289"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 74 → 77, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The user-visible deliverable is three URLs; the deliverable the sprint exists to prove is the second-order one, that three tickets with disjoint file-ownership maps and no `depends_on` edge need no coordination to land.

### 2026-08-11 — Sprint VRTX3-S-0020: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-1060413982`, `/api/healthz-smoke-bugfix2-521525844` and `/api/healthz-smoke-bugfix3-287868165`, each returning `{ok:true,variant:"<id>"}`. All three were reported missing and confirmed never written — a repo-wide grep for each variant id returned zero matches. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 71 → 74, and the "most recent set" pointer under [Features](#features) moves to this family. Scope, per-probe acceptance criteria and the "deliberately not covered" list are unchanged.

### 2026-08-11 — Sprint VRTX3-S-0019: Three Independent Health Check Endpoints (472035881)

Added `/api/healthz-smoke-472035881-a`, `-b` and `-c`, each returning `{ok:true,variant:"472035881"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 68 → 71, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The deliverable users actually care about is the second-order one: the three tasks carry disjoint file-ownership maps and no `depends_on` edge, so they prove again that independent leaf work needs no coordination.

### 2026-08-10 — Sprint VRTX3-S-0018: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-699186705`, `/api/healthz-smoke-bugfix2-502272230` and `/api/healthz-smoke-bugfix3-850084489`, each returning `{ok:true,variant:"<id>"}`. All three were reported missing and confirmed never written. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 65 → 68, and the "most recent set" pointer under [Features](#features) moves to this family. Scope, per-probe acceptance criteria and the "deliberately not covered" list are unchanged.

### 2026-08-10 — Sprint VRTX3-S-0017: Three Independent Health Check Endpoints (238855431)

Added `/api/healthz-smoke-238855431-a`, `-b` and `-c`, each returning `{ok:true,variant:"238855431"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 62 → 65, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The deliverable users actually care about is the second-order one: the three tasks carry disjoint file-ownership maps and no `depends_on` edge, so they prove again that independent leaf work needs no coordination.

### 2026-08-10 — Sprint VRTX3-S-0016: Three Independent Health Check Endpoints (756246354)

Added `/api/healthz-smoke-756246354-a`, `-b` and `-c`, each returning `{ok:true,variant:"756246354"}` — three separate leaf units of work with no shared code, built and merged in parallel. Purely additive: 6 new files, 0 modified source files, no new dependency, nothing in `src/`. Probe count 59 → 62, and the "most recent set" pointer under [Features](#features) moves to this family.

Scope, non-goals, user stories and the per-probe acceptance criteria are unchanged — this sprint adds instances of an existing feature, not a new one. The deliverable users actually care about is the second-order one: the three tasks carry disjoint file-ownership maps and no `depends_on` edge, so they prove again that independent leaf work needs no coordination.

### 2026-08-10 — Sprint VRTX3-S-0015: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-406186407`, `/api/healthz-smoke-bugfix2-487405332` and `/api/healthz-smoke-bugfix3-418626414`, each returning `{ok:true,variant:"<id>"}`. Purely additive: 6 new files, 0 modified. Probe count 56 → 59. Scope and per-probe acceptance criteria are unchanged; only the count and the most-recent-set pointer moved.

All three were reported as returning `404`; re-measured during planning against a live dev server, all three returned `200 text/html` (the SPA shell) instead — the seventh sprint in a row to find this. The defects were real, the status codes were not — see [AGENT.md § Gotchas](./AGENTS.md#gotchas).

### 2026-08-10 — Sprint VRTX3-S-0014: Bugfix Sprint – Three Missing Health Probes

Added `/api/healthz-smoke-bugfix-174694844`, `/api/healthz-smoke-bugfix2-754372119` and `/api/healthz-smoke-bugfix3-404580234`, each returning `{ok:true,variant:"<id>"}`. Purely additive: 6 new files, 0 modified. Probe count 53 → 56. Scope and per-probe acceptance criteria are unchanged; only the count and the most-recent-set pointer moved.

All three were reported as returning `404`; re-measured during planning, all three returned `200 text/html` (the SPA shell) instead. The defects were real, the status codes were not — see [AGENT.md § Gotchas](./AGENTS.md#gotchas).

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
