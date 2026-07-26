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
- **Lint/format**: ESLint 9 + typescript-eslint, Prettier, Husky + lint-staged

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

| Decision                    | Rationale                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React 19**                | Latest stable, ESM-first, better hooks ergonomics, Suspense for data fetching                                                                                      |
| **Vite 8**                  | Industry-standard bundler, HMR speed, first-class TypeScript support, ESM-native config                                                                            |
| **Nitro 3**                 | Full-stack with React SPA in same repo, zero-config routing, H3 middleware system                                                                                  |
| **SQLite + Drizzle**        | SQLite needs no separate database server (file-local), Drizzle provides type-safe ORM without runtime overhead, migrations committed alongside code                |
| **Bun runtime**             | `bun:sqlite` is the Bun native driver; Bun's speed and TypeScript support reduce dev/prod friction. Requirement: dev, test, and production must all run under Bun. |
| **Tailwind CSS v4**         | CSS-first design (no JS config file), performance, design tokens via custom properties, ecosystem of plugins                                                       |
| **shadcn-style primitives** | Radix + CVA patterns decouple styled primitives from app logic, supports composition + polymorphism, smaller bundle than full component library                    |
| **Playwright**              | Cross-browser E2E, pinned to `~1.50.0` to match QA container Chromium, snapshot testing support, fast iteration                                                    |

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0011: Health Check Endpoint

Added `/healthz-smoke-cancel-548090782` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-548090782.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies. Fourth example of the health check pattern.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

Added `/healthz-smoke-cancel-569985850` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-569985850.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies. Third example of the health check pattern.

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-158110053.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies. Second example of the health check pattern.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` endpoint to `routes/api/` with matching test in `routes/api/healthz-smoke-cancel-407995880.test.ts`. Demonstrates simple, self-contained GET endpoint pattern with no middleware or database dependencies.

### 2026-07-26 — Bootstrap sprint

Initial architecture documentation. Stack: React 19, Vite 8, Nitro 3, TypeScript 5, SQLite + Drizzle ORM, Tailwind CSS v4, shadcn-style primitives, Vitest + Playwright. File-based routing on frontend (vite-plugin-pages + react-router) and backend (Nitro H3). SQLite persistence in `db/`, migrations in `drizzle/`. Full test harness (unit, component, API integration, E2E smoke). GitHub Actions CI on `vortex/**` branches. Project requires Bun runtime for `bun:sqlite` support.
