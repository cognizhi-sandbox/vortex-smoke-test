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

Runs ESLint 9 + typescript-eslint, Prettier. Zero-warning policy — the build fails if any warnings exist.

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

- **Nitro's `serverDir`**: Defaults to `false` — must be `"./"` in `vite.config.ts` or `routes/` and `middleware/` never load. Ours is set correctly; don't change it.
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

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` endpoint as second example of simple self-contained API route. Pattern identical to SPRINT-0004 endpoint. See [Adding Tests](./AGENT.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-158110053.test.ts` when adding new endpoints.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` endpoint as example of simple self-contained API route. See [Adding Tests](./AGENT.md#adding-tests) for test pattern: integration test using real H3Event, no live server needed. Copy `routes/api/healthz-smoke-cancel-407995880.test.ts` when adding new endpoints.

### 2026-07-26 — Bootstrap sprint

Initial agent guide. Development workflow: `bun install`, `bun run dev`, `bun run build`. Verification gates: `bun run verify` (core, no browser), `bun run verify:full` (includes E2E). Conventions: file-based routing (frontend + backend), auto-imports (react + react-router), Tailwind v4 + shadcn pattern, Drizzle in `db/`, test tiers (unit/component/API/E2E). Gotchas: Nitro `serverDir: "./"`, Bun runtime requirement for `bun:sqlite`, Playwright on port 5178, ts-composite setup. CI via GitHub Actions on `vortex/**` branches.
