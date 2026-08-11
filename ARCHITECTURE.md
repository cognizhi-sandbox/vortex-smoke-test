# Architecture

See [PRODUCT.md](./PRODUCT.md) for what this is, [DESIGN.md](./DESIGN.md) for the visual system, and [AGENT.md](./AGENT.md) for the operating manual.

## Stack

- **Framework**: Vite 8 running a React 19 SPA + a Nitro 3 server together
- **Language**: TypeScript 5 (strict)
- **Frontend routing**: `vite-plugin-pages` (file-based) + `react-router` 8
- **Backend routing**: Nitro 3 / H3 2 (file-based)
- **Database**: SQLite via Bun's built-in `bun:sqlite` + Drizzle ORM — schema/client in `db/`, migrations in `drizzle/`. Requires the Bun runtime (dev, test, and production — see Deployment below)
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.ts`) + `tw-animate-css`
- **UI primitives**: shadcn/ui-style — Radix Slot, `class-variance-authority`, `cn()`
- **Icons**: `lucide-react`, `@heroicons/react`
- **Auto-imports**: `unplugin-auto-import` — `react` + `react-router` need no import
- **Fonts**: `unplugin-fonts` (config in `configs/fonts.config.ts`)
- **Tests**: Vitest + Testing Library (unit/integration/UI), Playwright (E2E/smoke)
- **Lint/format**: ESLint 10 + typescript-eslint, Prettier, Husky + lint-staged

Concrete versions are read from `package.json`: React 19.2, Vite 8.1, Nitro 3.0 (`^3.0.260610-beta`), TypeScript 5.9, Drizzle ORM 0.45 + drizzle-kit 0.31, Tailwind CSS 4.3, Vitest 4.1, Playwright `~1.60.0`, ESLint 10.7, react-router 8.2.

## Directory Structure

```
.
├── src/
│   ├── components/ui/   # shadcn/ui-style primitives (+ *.test.tsx)
│   ├── pages/            # Frontend routes, file-based (+ *.test.tsx)
│   ├── hooks/, utils/, types/, constants/, data/, store/
│   ├── test/              # Vitest setup
│   ├── index.css           # Tailwind v4 + design tokens
│   └── main.tsx
├── routes/api/            # Backend routes, file-based (+ *.test.ts)
├── middleware/             # Runs before every route handler
├── db/                      # Drizzle schema.ts + client.ts (sqlite connection, migrate, seed)
├── drizzle/                  # Generated SQL migrations (drizzle-kit generate), committed
├── e2e/                     # Playwright specs + global-setup.ts
├── configs/, scripts/
├── .github/workflows/       # GitHub Actions CI
├── server.ts                # Nitro server entry
├── vite.config.ts, vitest.config.ts, playwright.config.ts, drizzle.config.ts
├── tsconfig.json             # src
├── tsconfig.node.json          # server/config/test files
├── artifacts/               # Sprint plans and per-ticket docs
└── package.json
```

## Routing

**Frontend**: `src/pages/**/*.tsx` → routes (`about.tsx` → `/about`, `[id].tsx` → `/:id`, `[...all].tsx` → catch-all). `*.test.tsx` excluded via `Pages({ exclude })` in `vite.config.ts`.

**Backend**: `routes/api/*.ts` → `/api/*`, `middleware/*.ts` runs first and can set `event.context`. Requires `nitro({ serverDir: "./" })` in `vite.config.ts` — default is `false` (no scanning). `*.test.ts` excluded via `nitro({ ignore })`.

### Health probe route contract

`routes/api/healthz-smoke-*.ts` (77 files) each export a single default `defineHandler` from `nitro/h3` that takes no parameters and returns a literal `{ ok: true, variant: "<id>" }`. No `event` access, no imports beyond `nitro/h3`, no method guard — so every HTTP verb gets the same body (see [AGENT.md](./AGENT.md#gotchas)). The filename **is** the URL contract: `routes/api/x.ts` → `/api/x`, with no registration step, so a filename typo is a wrong URL with no other symptom.

`bun run build` emits one module per route under `.output/server/_routes/api/`, dashes converted to underscores — `/api/healthz-smoke-568557289-a` → `.output/server/_routes/api/healthz_smoke_568557289_a.mjs`. That output is how you confirm a route compiled into the production server; the colocated `*.test.ts` files are excluded from it by `nitro({ ignore })`.

## Data Flow Example

`GET /api/hello`: `middleware/auth.ts` sets `event.context.user` → `routes/api/hello.ts` reads it and responds. `routes/api/users/[id].ts` shows the dynamic-route + `createError()` 404 pattern, backed by a real query against `db/client.ts`'s Drizzle instance.

## Database

`db/schema.ts` defines Drizzle tables; `db/client.ts` opens the SQLite connection, runs pending migrations from `drizzle/`, and seeds two demo users if the table is empty. Routes import `db` and the table objects directly (see `routes/api/users/`) — no repository layer.

- `bun run db:generate` — after editing `db/schema.ts`, generates a new migration into `drizzle/` (via `drizzle-kit`, config in `drizzle.config.ts`)
- `bun run db:studio` — browse the db in Drizzle Studio
- The db file itself is `sqlite.db` at the project root (gitignored, created on first run); `drizzle/` migrations are committed
- Under Vitest (`VITEST=true`), `db/client.ts` swaps in an in-memory db instead, so tests never touch the dev database

## Testing

Four tiers, one worked example each. Commands and how to extend: [README.md](./README.md#testing), [AGENT.md](./AGENT.md).

## Deployment

- `ecosystem.config.js` (PM2) runs the real build: `.output/server/index.mjs`, under Bun (`interpreter: "bun"`) — required by `db/client.ts`'s `bun:sqlite` import. `nitro.service` (systemd) is the non-PM2 equivalent, same requirement.
- `Dockerfile`/`docker-compose.yml` build a static `dist/` served by nginx — don't rely on them for the Nitro/DB-backed API without fixing first (they never run `.output/server/index.mjs`)

---

## Key Decisions

| Decision                                | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19**                            | Latest stable, ESM-first, better hooks ergonomics, Suspense for data fetching                                                                                                                                                                                                                                                                                                                                                |
| **Vite 8**                              | Industry-standard bundler, HMR speed, first-class TypeScript support, ESM-native config                                                                                                                                                                                                                                                                                                                                      |
| **Nitro 3**                             | Full-stack with React SPA in same repo, zero-config routing, H3 middleware system                                                                                                                                                                                                                                                                                                                                            |
| **SQLite + Drizzle**                    | SQLite needs no separate database server (file-local), Drizzle provides type-safe ORM without runtime overhead, migrations committed alongside code                                                                                                                                                                                                                                                                          |
| **Bun runtime**                         | `bun:sqlite` is the Bun native driver; Bun's speed and TypeScript support reduce dev/prod friction. Requirement: dev, test, and production must all run under Bun.                                                                                                                                                                                                                                                           |
| **Tailwind CSS v4**                     | CSS-first design (no JS config file), performance, design tokens via custom properties, ecosystem of plugins                                                                                                                                                                                                                                                                                                                 |
| **shadcn-style primitives**             | Radix + CVA patterns decouple styled primitives from app logic, supports composition + polymorphism, smaller bundle than full component library                                                                                                                                                                                                                                                                              |
| **Playwright**                          | Cross-browser E2E, pinned to `~1.60.0` to match QA container Chromium, snapshot testing support, fast iteration                                                                                                                                                                                                                                                                                                              |
| **Health probes duplicate, on purpose** | Each `routes/api/healthz-smoke-*.ts` repeats ~8 lines rather than sharing a factory. A shared helper would make every probe a shared-file edit, which is exactly what the probes exist to disprove — they are the repo's standing evidence that independent units of work merge in parallel without conflict. Cost is bounded (the file never changes after it lands); benefit is a zero-overlap ownership map every sprint. |

---

## Changelog

### 2026-08-11 — Sprint VRTX3-S-0021: Three Independent Health Check Endpoints (568557289)

Added `routes/api/healthz-smoke-568557289-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 74 → 77, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

The filename-is-the-URL contract was re-measured live before implementation for the thirteenth consecutive sprint: all three unwritten paths returned `200 text/html` (the 949-byte SPA shell) rather than `404`, while the control `/api/healthz-smoke-528856326-a` returned `200 application/json` (33 bytes). That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

`## Key Decisions` is unchanged: the "Health probes duplicate, on purpose" entry already governs this sprint, and at 77 probes (156 `.ts` files under `routes/api/`, counted at sprint close) its cost/benefit reads the same — the files never change after they land, and the ownership map for each new probe still overlaps nothing.

### 2026-08-11 — Sprint VRTX3-S-0020: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-1060413982.ts`, `healthz-smoke-bugfix2-521525844.ts`, `healthz-smoke-bugfix3-287868165.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 71 → 74, re-counted from the filesystem rather than incremented.

The filename-is-the-URL contract was re-measured live before implementation for the twelfth consecutive sprint: all three unwritten paths returned `200 text/html` (the SPA shell) rather than `404`, while a written control returned `200 application/json`. That is the contract working as designed — an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

### 2026-08-11 — Sprint VRTX3-S-0019: Three Independent Health Check Endpoints (472035881)

Added `routes/api/healthz-smoke-472035881-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 68 → 71, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

### 2026-08-10 — Sprint VRTX3-S-0018: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-699186705.ts`, `healthz-smoke-bugfix2-502272230.ts`, `healthz-smoke-bugfix3-850084489.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 65 → 68, re-counted from the filesystem rather than incremented.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them. The filename-is-the-URL contract is also the root cause of all three defects: no registration step means a file that was never written is a path that was never registered, with the SPA fallback as the only symptom.

### 2026-08-10 — Sprint VRTX3-S-0017: Three Independent Health Check Endpoints (238855431)

Added `routes/api/healthz-smoke-238855431-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 62 → 65, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

One consequence of that decision is now visible and worth recording against it: the family is large enough (65 handlers, 65 tests, 131 files in `routes/api/`) that **new work samples the directory instead of the documented template**. This sprint's idea named a pre-VRTX3-S-0011 test file, carrying a flaky wall-clock assertion, as the pattern to copy — a drift mechanism that arrives with scale, not with any individual mistake. The mitigation stays documentary rather than structural (see [AGENT.md](./AGENT.md#health-probe-routes)): factoring out a shared handler to shrink the family would trade a copy-source ambiguity for the shared-file edits the probes exist to disprove. Worth revisiting only if probe retention is ever decided.

### 2026-08-10 — Sprint VRTX3-S-0016: Three Independent Health Check Endpoints (756246354)

Added `routes/api/healthz-smoke-756246354-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified source files, no dependency change. Probe-family count under [Routing](#routing) updated 59 → 62, re-counted from the filesystem rather than incremented, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

Worth recording against the [Routing](#routing) contract: the filename-is-the-URL property was re-measured live before implementation, and all three unwritten paths returned `200 text/html` (the SPA shell) rather than `404`. That is the contract working as designed — Nitro resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts`, and an unresolved path is handed to the SPA — but it means the route table cannot be probed by status code. Confirm a route compiled by looking for its module under `.output/server/_routes/api/`.

### 2026-08-10 — Sprint VRTX3-S-0015: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-406186407.ts`, `healthz-smoke-bugfix2-487405332.ts`, `healthz-smoke-bugfix3-418626414.ts` and their colocated tests — 6 new files, 0 modified, no dependency change.

**Corrected a stale count in [Routing](#routing):** the probe-family figure read 53 files while the tree held 56. VRTX3-S-0014 bumped the count in `AGENT.md` and `PRODUCT.md` but missed this doc, so the number had been wrong for a sprint. Re-counted from the filesystem rather than incremented from the previous value, and now reads 59 (56 existing + this sprint's 3).

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 governs this sprint and was applied as written — three disjoint two-file ownership maps, no `depends_on` between them.

### 2026-08-09 — Sprint VRTX3-S-0013: Three Independent Health Check Endpoints (841017405)

Added `routes/api/healthz-smoke-841017405-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified, no dependency change. Probe-family count under [Routing](#routing) updated 50 → 53, and the build-output naming example refreshed to a route from this sprint.

No architectural change. Nothing in the stack, data model, deployment path or [Key Decisions](#key-decisions) moved; the no-shared-helper decision recorded in VRTX3-S-0011 already governs this sprint and was applied as written. Versions were re-read from `package.json` rather than carried forward and match what is documented under [Stack](#stack) — ESLint 10.7, Playwright `~1.60.0`, Vitest 4.1, Nitro `^3.0.260610-beta`.

### 2026-08-09 — Sprint VRTX3-S-0012: Bugfix Sprint – Three Missing Health Probes

Added `routes/api/healthz-smoke-bugfix-6202295.ts`, `healthz-smoke-bugfix2-433928318.ts`, `healthz-smoke-bugfix3-196651982.ts` and their colocated tests — 6 new files, 0 modified, no dependency change. Probe-family count under [Routing](#routing) updated 47 → 50.

No architectural change. The three defects were all the same missing-artifact class: Nitro 3 resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts`, so a file that was never written is a path that was never registered — which is exactly the filename-is-the-URL contract already recorded under [Routing](#routing), working as designed.

### 2026-08-09 — Sprint VRTX3-S-0011: Three Independent Health Check Endpoints (528856326)

Added `routes/api/healthz-smoke-528856326-a.ts`, `-b.ts`, `-c.ts` and their colocated tests — 6 new files, 0 modified, no dependency change. Documented the probe family as an explicit interface contract under [Routing](#routing) (handler shape, filename-is-the-URL, build-output naming), and recorded the deliberate no-shared-helper choice in [Key Decisions](#key-decisions) so it stops being re-litigated each sprint.

Version corrections measured from `package.json` rather than carried forward: ESLint is **10**, not 9; Playwright is pinned to **`~1.60.0`**, not `~1.50.0` as the Key Decisions table claimed. Concrete versions for the whole stack are now listed once under [Stack](#stack).

### 2026-08-05 — Sprint VRTX3-S-0006: Three Independent Health Check Endpoints

Added three completely independent health-check endpoints to `routes/api/`: `/healthz-smoke-913793173-a`, `/healthz-smoke-913793173-b`, `/healthz-smoke-913793173-c`. Each endpoint is a completely standalone file with matching integration tests, demonstrating parallel development without code sharing. Validates the pattern established in prior sprints (SPRINT-0004, SPRINT-0005, SPRINT-0007, SPRINT-0019, VRTX3-S-0002, VRTX3-S-0003, VRTX3-S-0001). Shows scalability of file-based routing for adding multiple independent features concurrently.

### 2026-08-02 — Sprint VRTX3-S-0004: Three Independent Health Check Endpoints

Added three independent health check endpoints to `routes/api/`: `/healthz-smoke-680958919-a`, `/healthz-smoke-680958919-b`, `/healthz-smoke-680958919-c`. Each endpoint is a completely standalone file with matching integration tests, demonstrating parallel development without code sharing. Validates the pattern established in SPRINT-0019 (SPRINT-0004, SPRINT-0005, SPRINT-0007) health check endpoints. Shows scalability of file-based routing for adding multiple independent features concurrently.

### 2026-07-26 — Sprint SPRINT-0019: Three Independent Health Check Endpoints

Added three independent health check endpoints to `routes/api/`: `/healthz-smoke-302960562-a`, `/healthz-smoke-302960562-b`, `/healthz-smoke-302960562-c`. Each endpoint is a completely standalone file with matching integration tests, demonstrating parallel development without code sharing. Validates the pattern established in SPRINT-0004, SPRINT-0005, SPRINT-0007 health check endpoints. Shows scalability of file-based routing for adding multiple independent features concurrently.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

Added `/healthz-smoke-cancel-569985850` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-569985850.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies. Third example of the health check pattern.

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-158110053.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies. Second example of the health check pattern.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-407995880.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies.

### 2026-07-26 — Bootstrap sprint

Initial architecture documentation. Stack: React 19, Vite 8, Nitro 3, TypeScript 5, SQLite + Drizzle ORM, Tailwind CSS v4, shadcn-style primitives, Vitest + Playwright. File-based routing on frontend (vite-plugin-pages + react-router) and backend (Nitro H3). SQLite persistence in `db/`, migrations in `drizzle/`. Full test harness (unit, component, API integration, E2E smoke). GitHub Actions CI on `vortex/**` branches. Project requires Bun runtime for `bun:sqlite` support.
