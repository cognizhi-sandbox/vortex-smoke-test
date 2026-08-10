# Agent Guide

`CLAUDE.md` is a symlink to this file.

See [PRODUCT.md](./PRODUCT.md) for what this project is, [ARCHITECTURE.md](./ARCHITECTURE.md) for the stack and key decisions, and [DESIGN.md](./DESIGN.md) for the visual system.

## Build & Run

### Install

```bash
bun install
```

### Development Server

```bash
bun run dev
```

Starts both the Vite SPA (frontend) and Nitro server (backend) on:

- Frontend: http://localhost:5000 (also http://0.0.0.0:5000)
- Backend API: available via proxying in dev mode

Hot module reload (HMR) enabled for both `.tsx` files and server routes.

### Production Build

```bash
bun run build
```

Outputs:

- `dist/` — Vite SPA bundle (static files)
- `.output/server/index.mjs` — Nitro server (run under Bun: `bun .output/server/index.mjs`)

---

## Test & Validate

### Unit/Component/API Tests

```bash
bun run test
```

Runs Vitest on:

- `src/**/*.test.tsx` — component/page UI tests (jsdom, React Testing Library)
- `src/**/*.test.ts` — utility unit tests
- `routes/**/*.test.ts` — API route integration tests (Node environment, real `H3Event`, no live server)

All test files use `Node_ENV=test` and `VITEST=true` env vars, which makes `db/client.ts` use an in-memory SQLite database (no `sqlite.db` touched).

### Type Check

```bash
bun run typecheck
```

Runs `tsc --build` on the full project (src + server files). TypeScript strict mode enabled.

### Lint

```bash
bun run lint
```

Runs ESLint 10 + typescript-eslint, Prettier. Zero-warning policy (`--max-warnings 0`) — the build fails if any warnings exist.

### Full Verification (Core Gate, No Browser)

```bash
bun run verify
```

Runs: `lint && typecheck && test` in sequence. Use this locally to validate before pushing.

### E2E Smoke Test (Requires Browser)

```bash
bun run test:smoke
```

Runs a single Playwright spec (`e2e/smoke.spec.ts`) against the dev server:

- Home page loads (HTTP 200)
- Main heading is visible
- No console errors
- API `/api/hello` responds

Requires Chromium installed. If missing, fails with a clear message. Fall back to `bun run verify` if Chromium is unavailable locally.

### Full E2E Suite

```bash
bun run test:e2e
```

or

```bash
bun run e2e
```

Runs all Playwright specs in `e2e/`. Same Chromium requirement as smoke test.

### Full Verification (Complete Gate, Includes E2E)

```bash
bun run verify:full
```

Runs: `lint && typecheck && test && test:e2e`. Use this before shipping or if CI is failing on E2E. Requires Chromium.

---

## Conventions

### File-Based Routing

**Frontend** (`src/pages/**/*.tsx`):

```
src/pages/
  index.tsx           → /
  about.tsx           → /about
  blog/[id].tsx       → /blog/:id
  [...all].tsx        → /* (catch-all)
  page.test.tsx       → excluded from routing (Pages({ exclude }))
```

**Backend** (`routes/api/**/*.ts`):

```
routes/api/
  hello.ts              → GET /api/hello
  hello.post.ts         → POST /api/hello
  users/index.get.ts    → GET /api/users
  users/[id].ts         → GET /api/users/:id (dynamic routes)
  hello.test.ts         → excluded from routes (nitro({ ignore }))
```

Middleware runs on every route:

```
middleware/
  auth.ts               → sets event.context.user
```

### Health Probe Routes

`routes/api/healthz-smoke-*.ts` is a family of 65 near-identical GET probes, each returning `{ ok: true, variant: "<id>" }`. Adding one: copy `routes/api/healthz-smoke-528856326-a.ts` and its `.test.ts` sibling, change the variant string, change nothing else.

**Copy that pair, not an older one — and not one an idea names.** 47 of the probe tests, all written before VRTX3-S-0011 (e.g. `healthz-smoke-913793173-a.test.ts`, `healthz-smoke-126862920-c.test.ts`), carry a second `responds in under 100ms` case. Wall-clock assertions on a shared CI runner are flaky and prove nothing about the contract, so the current pattern is a single body assertion. Don't propagate the timing case into new probes. Ideas and defect reports occasionally name one of those older files as the template — VRTX3-I-0026 named `healthz-smoke-126862920-c.test.ts` — because they sample the directory rather than read this line. **This pointer outranks the pointer in an idea canvas:** copy the `528856326` pair, keep the single body assertion, and note the substitution in the work log.

**The duplication is deliberate — do not factor out a shared handler, factory, constants file or barrel export.** Independence is the point: each probe must be buildable and mergeable without touching any file another probe owns. See [ARCHITECTURE.md](./ARCHITECTURE.md#key-decisions).

A probe must not read `event.context.user` (unlike `routes/api/hello.ts`) and must not import from `db/`, so it stays answerable when auth and the database are unavailable.

### Auto-Imports

No `import React from 'react'` or `import { useState } from 'react'` needed — auto-imported via `unplugin-auto-import`:

```tsx
// This just works:
const App = () => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
};
```

Same for `react-router` (useNavigate, useParams, useLocation, etc.).

### Styling

Tailwind CSS v4 (CSS-first, no JavaScript config):

- Custom properties (tokens) live in `src/index.css` under `:root` (light) and `.dark` (dark)
- Add new tokens: edit `src/index.css`, then use in markup as `bg-primary`, `text-foreground`, etc.
- No `tailwind.config.ts` — Tailwind scans `src/` for class usage and generates only what's used

shadcn-style primitives:

- Pattern: `src/components/ui/button.tsx` + `button-variants.ts`
- Variants via `class-variance-authority` (CVA)
- Polymorphism via Radix `Slot` (`asChild` prop)
- Class merging via `cn()` — last call wins, so consumers can override

### Database

Drizzle ORM with SQLite (`db/schema.ts` + `db/client.ts`):

- Schema defined in `db/schema.ts`, imported in routes as `import { db } from '@/db'`
- Migrations auto-generated and committed to `drizzle/`
- After editing schema: `bun run db:generate` → creates migration file
- Dev database is `sqlite.db` (gitignored); test database is in-memory (via `VITEST=true`)

### Testing

| Type           | Location                            | Tool             | Example                                      |
| -------------- | ----------------------------------- | ---------------- | -------------------------------------------- |
| Unit           | `src/utils/cn.test.ts`              | Vitest           | Pure function testing                        |
| Component/Page | `src/components/ui/button.test.tsx` | Vitest + RTL     | Render, query, userEvent                     |
| API Route      | `routes/api/hello.test.ts`          | Vitest + H3Event | Mock event, call handler, assert response    |
| E2E/Smoke      | `e2e/home.spec.ts`                  | Playwright       | Real browser, real dev server, critical path |

New test files: copy a similar existing test file (see [Adding Tests](./AGENT.md#adding-tests) below).

---

## Adding Tests

| You changed...                            | Add...                                      | Copy from                           |
| ----------------------------------------- | ------------------------------------------- | ----------------------------------- |
| A util (`src/utils`)                      | Unit test, `<name>.test.ts`                 | `src/utils/cn.test.ts`              |
| A component                               | UI test, `<name>.test.tsx`                  | `src/components/ui/button.test.tsx` |
| A page                                    | UI test, `<name>.test.tsx`                  | `src/pages/index.test.tsx`          |
| An API route/middleware                   | Integration test, real `H3Event`, no server | `routes/api/hello.test.ts`          |
| A cross-page/responsive/browser-only flow | Playwright spec in `e2e/`                   | `e2e/home.spec.ts`                  |

---

## Gotchas

- **A missing `/api/*` route returns `200 text/html`, NOT `404`.** An unmatched API path falls through to the SPA `index.html` shell, in `bun run dev` and in the production build alike (nginx does not change this — `location /api/` proxies straight to Nitro with `proxy_intercept_errors` off). So **status code alone cannot tell a working endpoint from a missing one**, and a `404 → 200` check proves nothing. When adding or verifying an API route, assert on the **response body and `Content-Type`**:

  ```bash
  # missing route  → 200 text/html; charset=utf-8       (the SPA shell)
  # working route  → 200 application/json;charset=UTF-8 {"ok":true,...}
  curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/<route>
  ```

  Seven consecutive sprints (VRTX3-S-0001, -0007, -0008, -0009, -0012, -0014, -0015) each re-discovered this after acting on a bug report that claimed `404`. The mis-transcription originates upstream in defect capture, not in this repo, so it will keep arriving — **treat a `404` in an incoming defect report for an `/api/*` path as a mis-transcription by default** — the defect is usually real, but its stated status code is not; re-measure before planning any verification around it. Note also that a route's **unit test imports the handler module directly**, so it passes even if Nitro never registered the path — only a live request proves the route is wired.

  **This is not only a bugfix-sprint trap.** VRTX3-S-0016 and VRTX3-S-0017 were additive enhancements with no `404` claim to debunk, and in both the not-yet-written paths still answered `200 text/html` while the control answered `200 application/json` — nine consecutive confirmations across both sprint shapes. Whenever you need to know whether an `/api/*` route exists — adding one, verifying one, or triaging one — measure the body and `Content-Type`. There is no sprint shape in which the status code answers the question.

- **Nitro's `serverDir`**: Defaults to `false` — must be `"./"` in `vite.config.ts` or `routes/` and `middleware/` never load. Ours is set correctly; don't change it.
- **API route handlers are method-agnostic**: none of the `healthz-smoke-*` handlers declare a method guard, so `POST`/`PUT`/`DELETE` return the same `200` JSON body as `GET`. Don't add a `405` to one route in isolation — it would make it inconsistent with every other `healthz-smoke-*` route. If an idea's acceptance criteria claim a non-`GET` request "does not return the 200 body", that claim is wrong for this stack: check whether the same idea also puts custom method handling out of scope (it usually does), and plan to the out-of-scope line, not the claim.
- **Page tests**: `Pages()` needs `exclude: ["**/*.test.tsx"]` or the build breaks on the first page test. Our `vite.config.ts` has this.
- **Route tests**: `nitro()` needs `ignore: ["**/*.test.ts"]` or route tests get bundled into the prod server. Our `vite.config.ts` has this.
- **Auto-imports**: `auto-imports.d.ts` doesn't exist on a fresh clone — `prebuild` and `pretypecheck` scripts generate it. If `tsc` fails on a new machine, run `node scripts/ensure-generated-files.mjs` first.
- **Playwright port**: Runs on port 5178, not 5000, so it never collides with the dev server.
- **tsconfig.node.json**: Is `composite: true` — can't set `noEmit`, so it has its own `outDir` to avoid scattering compiled files.
- **Database client**: `db/client.ts` resolves `sqlite.db` and `drizzle/` from `process.cwd()`, not `import.meta.url` — Vite/Nitro/Vitest all transform this module, so its `import.meta.url` isn't a real file URL. Test under Vitest uses in-memory db.
- **Bun requirement**: `db/client.ts` imports `bun:sqlite` (Bun builtin), so anything that loads it must run under Bun. Consequences:
  - `vitest.config.ts` splits into a `client` project (jsdom, everything except `routes/**`) and a `server` project (`environment: "node"`, `routes/**/*.test.ts`)
  - `test` and `test:watch` run `bun --bun vitest` (not plain `vitest`)
  - Production server `.output/server/index.mjs` needs Bun runtime (PM2/systemd: set `interpreter: "bun"`)
- **Branch protection**: Recommended to set required status checks on `vortex/sprint/*` and `vortex/feat/*` branches to enforce CI passing before merge.
- **Husky hooks**: Pre-commit runs `lint-staged` on staged files only; doesn't run full lint or test. Run `bun run verify` locally before committing to catch issues early.

---

## Changelog

### 2026-08-10 — Sprint VRTX3-S-0017: Three Independent Health Check Endpoints (238855431)

Added `/api/healthz-smoke-238855431-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "238855431" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 62 → 65, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The copy-source pointer in [Health Probe Routes](#health-probe-routes) now outranks the idea canvas, and says so.** VRTX3-I-0026 named `routes/api/healthz-smoke-126862920-c.test.ts` as the test template. That file is one of the 47 pre-VRTX3-S-0011 probe tests carrying the flaky `responds in under 100ms` case — the exact assertion this guide has told three sprints running not to propagate. The idea was not wrong about the shape it wanted (its own risk register says "prefer body assertions… or omit"), it just sampled the directory instead of reading this line. Ideas will keep doing that as long as 47 of 65 tests carry the old shape, so the rule is now explicit: the `528856326` pair wins over any file an idea names.

**Ninth consecutive confirmation of the SPA-fallback trap, second on an enhancement.** Re-measured on a live dev server during planning: all three target paths returned `200 text/html; charset=utf-8` (the SPA shell), the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8`. Note the dev server binds `5005` in the planning container when `5000` is taken — check the Vite banner rather than assuming the port.

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

### 2026-08-10 — Sprint VRTX3-S-0016: Three Independent Health Check Endpoints (756246354)

Added `/api/healthz-smoke-756246354-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "756246354" }`. Purely additive — 6 new files, 0 existing source files modified, no new dependency, nothing in `src/`. Probe family count 59 → 62, re-derived from the filesystem and bumped in all three docs that carry it (`AGENT.md`, `ARCHITECTURE.md`, `PRODUCT.md`) in the same pass.

**The SPA-fallback trap is not a bugfix-only phenomenon, and [Gotchas](#gotchas) now says so.** Every prior confirmation came from a defect report claiming `404`. This sprint was an additive enhancement with no such claim, and the baseline was measured anyway during planning: all three target paths returned `200 text/html; charset=utf-8` (the SPA `index.html` shell) before implementation, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json;charset=UTF-8` with its variant body. Eighth consecutive confirmation, first one on an enhancement — so the rule is now stated as "measure the body whenever you need to know whether a route exists", not "distrust `404`s in defect reports".

No change to routing, the test harness or CI. `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone; the Vitest `server` project collects its colocated `*.test.ts` with no configuration; `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`. The `528856326` copy-source pointer held for a third sprint — no new probe test carries the flaky `responds in under 100ms` case.

### 2026-08-10 — Sprint VRTX3-S-0015: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-406186407`, `/api/healthz-smoke-bugfix2-487405332`, `/api/healthz-smoke-bugfix3-418626414`. Purely additive — 6 new files, 0 existing files modified. Probe family count 56 → 59.

**Seventh consecutive sprint to hit the SPA-fallback trap.** Re-measured on a live dev server during planning rather than cited from prior records: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-bugfix3-404580234` returned `200 application/json;charset=UTF-8`. Repo-wide grep for each variant id returned zero matches, confirming never-written files rather than typo'd filenames. Worth noting the upstream improvement: the idea canvas for VRTX3-I-0024 **pre-emptively flagged its own `404` as a likely mis-transcription** and asked for a measurement, rather than asserting it as fact — the first time capture has caught this itself. The [Gotchas](#gotchas) entry now records the seventh occurrence.

**Fixed a stale probe count in `ARCHITECTURE.md`.** Its § Routing figure read 53 files while the tree held 56 — VRTX3-S-0014 bumped `AGENT.md` and `PRODUCT.md` but missed that doc. All three counts are now re-derived from the filesystem, not incremented blind: 59. If you bump one, bump all three.

### 2026-08-10 — Sprint VRTX3-S-0014: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-174694844`, `/api/healthz-smoke-bugfix2-754372119`, `/api/healthz-smoke-bugfix3-404580234`. Purely additive — 6 new files, 0 existing files modified. Probe family count 53 → 56.

**Sixth consecutive sprint to hit the SPA-fallback trap**, and this time the idea canvas itself carried the wrong status code through a full evidence section. Re-measured on `bun run dev` during planning rather than cited from prior records: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-841017405-a` returned `200 application/json;charset=UTF-8`. Repo-wide grep for each variant id returned zero matches, confirming a never-written file rather than a typo'd filename. The [Gotchas](#gotchas) entry now records that the mis-transcription originates upstream in defect capture and will keep arriving.

The single-assertion probe-test shape held: the `528856326` copy-source pointer added in VRTX3-S-0013 did its job, and the flaky `responds in under 100ms` case was kept out of all three new tests.

### 2026-08-09 — Sprint VRTX3-S-0013: Three Independent Health Check Endpoints (841017405)

Added `/api/healthz-smoke-841017405-a`, `-b` and `-c`, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "841017405" }`. Purely additive — 6 new files, 0 existing files modified, no new dependency, nothing in `src/`. Probe family count 50 → 53.

**One correction to the recipe in [Health Probe Routes](#health-probe-routes), and it matters.** The copy-source named there was `healthz-smoke-302960562-a`, whose `.test.ts` carries a second `expect(elapsed).toBeLessThan(100)` case. That assertion is machine-dependent, is a known CI-flake source, and was already dropped once — VRTX3-S-0011 deliberately omitted it and produced the single-assertion shape in `healthz-smoke-528856326-a.test.ts`. Because the recipe still pointed at the old file, the flaky case was one copy-paste away from coming back every sprint. The named source is now the `528856326` pair, with an explicit note not to propagate the timing case.

No change to routing, the test harness or CI: `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by filename alone, the Vitest `server` project picks up its colocated `*.test.ts` with no configuration, and `.github/workflows/ci.yml` already triggers on `push` and `pull_request` to `vortex/**`.

Stack facts re-checked against `package.json` this sprint and confirmed already accurate here: ESLint `^10.7.0`, Playwright `~1.60.0`, Vitest `^4.1.10`, Nitro `^3.0.260610-beta`.

### 2026-08-09 — Sprint VRTX3-S-0012: Bugfix Sprint – Three Missing Health Probes

Added three missing health probes, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-6202295`, `/api/healthz-smoke-bugfix2-433928318`, `/api/healthz-smoke-bugfix3-196651982`. Purely additive — 6 new files, 0 existing files modified. Probe family count ~47 → ~50.

**Fifth consecutive sprint to hit the SPA-fallback trap.** All three were again reported as returning `404`. Re-measured directly on `bun run dev` during planning rather than cited from prior records: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-bugfix3-993514120` returned `200 application/json;charset=UTF-8`. The [Gotchas](#gotchas) entry now says to treat a reported `404` on an `/api/*` path as a mis-transcription by default — the defect is real, the status code in the report is not.

### 2026-08-09 — Sprint VRTX3-S-0011: Three Independent Health Check Endpoints (528856326)

Added three independent health-probe endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "528856326" }`: `/api/healthz-smoke-528856326-a`, `-b`, `-c`. Purely additive — 6 new files, 0 existing files modified, no new dependency. Each is a self-contained handler with a colocated `H3Event` integration test; no shared helper, no cross-import.

The probe pattern has been promoted out of this changelog into [Conventions → Health Probe Routes](#health-probe-routes), so the next agent finds the "don't factor out a shared handler" rule before writing code rather than after.

Two corrections to this guide, both measured against the repo rather than carried forward: **lint is ESLint 10** (`^10.7.0` in `package.json`), not ESLint 9 as previously documented here; and the method-agnostic gotcha now says what to do when an idea's acceptance criteria contradict it — this sprint's idea asserted that `POST`/`PUT`/`DELETE` "does not return the 200 success body", which is false for these handlers. Planned to the idea's own out-of-scope line ("no non-GET methods", no custom method handling) instead.

### 2026-08-09 — Sprint VRTX3-S-0009: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-755467473`, `/api/healthz-smoke-bugfix2-192341379`, `/api/healthz-smoke-bugfix3-993514120`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Fourth consecutive sprint to hit the SPA-fallback trap — so the lesson has been promoted out of this changelog into [Gotchas](#gotchas), where the next agent will actually find it.** All three endpoints were again reported as "returning 404". Measured during planning on `bun run dev`: each missing path returned `200 text/html; charset=utf-8` (the SPA `index.html` shell), while the working controls (`...-739648350`, `...-901895284`, `...-221117839`) returned `200 application/json;charset=UTF-8`. Prior sprints cited this from earlier records; this sprint re-measured it directly and confirmed it.

The method-agnostic behaviour of these handlers (previously recorded here for VRTX3-S-0008) has likewise moved to Gotchas, re-verified by direct measurement against a control route.

### 2026-08-08 — Sprint VRTX3-S-0008: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-739648350`, `/api/healthz-smoke-bugfix2-901895284`, `/api/healthz-smoke-bugfix3-221117839`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Third consecutive sprint to re-confirm the SPA-fallback gotcha.** All three were again reported as "returning 404". They were not: on `bun run dev`, each missing path returned `200` with `Content-Type: text/html` (the SPA `index.html` shell), while the working control `/api/healthz-smoke-bugfix3-605591646` returned `200 application/json;charset=UTF-8`. A status-code assertion passes whether or not the route exists — **when adding or verifying an API route, assert on the response body and `Content-Type`, never on a 404→200 transition.**

Two further details measured this sprint, both previously assumed rather than checked:

- **The handlers are method-agnostic.** `POST`/`PUT`/`DELETE` against a `healthz-smoke-*` route return the same `200` JSON body as `GET`, not a 405 or 500. None of the siblings declare a method guard; don't add one.
- **Route → build-output naming.** `bun run build` emits one module per route under `.output/server/_routes/api/`, with dashes converted to underscores — e.g. `/api/healthz-smoke-bugfix3-605591646` → `.output/server/_routes/api/healthz_smoke_bugfix3_605591646.mjs`. Useful for confirming a route actually compiled into the production server.

### 2026-08-06 — Sprint VRTX3-S-0007: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and body `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-534542341`, `/api/healthz-smoke-bugfix2-279986033`, `/api/healthz-smoke-bugfix3-605591646`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Reconfirms the VRTX3-S-0001 gotcha, with measurements.** All three were reported as "returning 404". They were not: on `bun run dev`, each missing path returned `200` with `Content-Type: text/html` (the SPA `index.html` fallback), while the working control `/api/healthz-smoke-bugfix3-764107669` returned `200 application/json;charset=UTF-8`. A status-code assertion therefore passes whether or not the route exists — **when adding or verifying an API route, assert on the response body and `Content-Type`, never on a 404→200 transition.**

### 2026-08-05 — Sprint VRTX3-S-0006: Three Independent Health Check Endpoints

Added three completely independent health-check endpoints (`/api/healthz-smoke-913793173-a`, `/api/healthz-smoke-913793173-b`, `/api/healthz-smoke-913793173-c`), each returning `{ok:true,variant:"913793173"}`. Demonstrates parallel endpoint development pattern with zero interdependencies and no shared code. Each endpoint is self-contained with integration tests using H3Event pattern. Reference implementation for adding multiple endpoints without coordination overhead.

### 2026-08-05 — Sprint VRTX3-S-0001: Bugfix Sprint – Three Missing Health Check Endpoints

Added three missing health check endpoints, each returning HTTP 200 with `Content-Type: application/json` and a body of `{ ok: true, variant: "<id>" }`: `/api/healthz-smoke-bugfix-868175391`, `/api/healthz-smoke-bugfix2-101584827`, `/api/healthz-smoke-bugfix3-403022997`. Purely additive — 6 new files, 0 existing files modified. Each is a self-contained handler following the established H3Event integration test pattern (no auth, no database, no code sharing).

**Gotcha worth knowing (applies beyond this sprint):** these endpoints were reported as "returning 404". They were not. An unmatched `/api/*` path is answered by the **SPA `index.html` fallback with `200 text/html`** — in `bun run dev` and in the production build alike (nginx does not change this; `/api/` proxies straight to Nitro with `proxy_intercept_errors` off). So a missing API route is indistinguishable from a working one by status code alone. When adding or verifying an API route, **assert on the response body and `Content-Type`, never on a 404→200 transition** — such a check passes whether or not the route exists.

### 2026-08-02 — Sprint VRTX3-S-0004: Three Independent Health Check Endpoints

Added three independent health check endpoints demonstrating parallel development without code sharing. Endpoints: `/api/healthz-smoke-680958919-a`, `/api/healthz-smoke-680958919-b`, `/api/healthz-smoke-680958919-c`. Each endpoint is a completely self-contained file returning `{ok:true,variant:"680958919"}`. Pattern: zero interdependencies, independent tests, independent commits. Demonstrates that multiple endpoints can be built concurrently with no coordination overhead. See [Adding Tests](./AGENT.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed.

### 2026-08-02 — Sprint VRTX3-S-0003: Bugfix Sprint – Three Missing Health Check Endpoints

Fixed three more missing health check endpoints that were returning 404 errors. Each endpoint is now available and returns HTTP 200 with a simple JSON response (`{ ok: true, variant: "<id>" }`). Endpoints: `/api/healthz-smoke-bugfix-26031336`, `/api/healthz-smoke-bugfix2-59156521`, `/api/healthz-smoke-bugfix3-200192357`. All endpoints follow the established H3Event integration test pattern with no external dependencies (no auth, no database, no code sharing). See [Adding Tests](./AGENT.md#adding-tests) for the test pattern.

### 2026-08-02 — Sprint VRTX3-S-0002: Bugfix Sprint – Three Missing Health Check Endpoints

Fixed three missing health check endpoints that were returning 404 errors. Each endpoint is now available and returns HTTP 200 with a simple JSON response (`{ ok: true, variant: "<id>" }`). Endpoints: `/api/healthz-smoke-bugfix-106285986`, `/api/healthz-smoke-bugfix2-524723214`, `/api/healthz-smoke-bugfix3-764107669`. All endpoints follow the established H3Event integration test pattern with no external dependencies (no auth, no database, no code sharing). See [Adding Tests](./AGENT.md#adding-tests) for the test pattern.

### 2026-07-26 — Sprint SPRINT-0019: Three Independent Health Check Endpoints

Added three independent health check endpoints (`/api/healthz-smoke-302960562-a`, `/api/healthz-smoke-302960562-b`, `/api/healthz-smoke-302960562-c`) as worked examples of parallel endpoint development without code sharing. Each endpoint follows the H3Event integration test pattern; copy `routes/api/healthz-smoke-302960562-a.test.ts` when adding new endpoints. Demonstrates that multiple endpoints can be built concurrently with no coordination overhead.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

Added `/healthz-smoke-cancel-569985850` endpoint as third example of simple self-contained API route. Pattern identical to SPRINT-0004 and SPRINT-0005 endpoints. See [Adding Tests](./AGENT.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-569985850.test.ts` when adding new endpoints.

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` endpoint as second example of simple self-contained API route. Pattern identical to SPRINT-0004 endpoint. See [Adding Tests](./AGENT.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-158110053.test.ts` when adding new endpoints.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` endpoint as example of simple self-contained API route. See [Adding Tests](./AGENT.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-407995880.test.ts` when adding new endpoints.

### 2026-07-26 — Bootstrap sprint

Initial agent guide. Development workflow: `bun install`, `bun run dev`, `bun run build`. Verification gates: `bun run verify` (core, no browser), `bun run verify:full` (includes E2E). Conventions: file-based routing (frontend + backend), auto-imports (react + react-router), Tailwind v4 + shadcn pattern, Drizzle in `db/`, test tiers (unit/component/API/E2E). Gotchas: Nitro `serverDir: "./"`, Bun runtime requirement for `bun:sqlite`, Playwright on port 5178, ts-composite setup. CI via GitHub Actions on `vortex/**` branches.
