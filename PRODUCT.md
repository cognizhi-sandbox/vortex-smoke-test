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
- **Testing**: Vitest + React Testing Library (unit/component/API integration tests), Playwright for E2E and smoke tests — all working examples, all scripts in `package.json`
- **Styling**: Tailwind CSS v4 (CSS-first, no config files), shadcn/ui-style component primitives, custom design tokens
- **DevEx**: ESLint 9 + typescript-eslint, Prettier, Husky pre-commit hooks, hot module reload, sourcemaps
- **Deployment**: Bun-based production server (`.output/server/index.mjs`), Docker/docker-compose for containerization
- **CI/CD**: GitHub Actions workflow triggering on `vortex/**` branches

### Not in Scope

- Real authentication (stub middleware exists; swap with real auth before shipping)
- Domains features or business logic (boilerplate only)
- Component library beyond shadcn-style primitives
- Custom visualization/charting framework
- Mobile-specific optimization

## Success Criteria

✅ Application builds and runs locally from a clean checkout  
✅ Home page renders and shows the project name  
✅ Type-check, lint, and unit tests pass  
✅ End-to-end smoke test passes against the running app  
✅ CI is green on the sprint branch (typecheck, lint, test, build all pass)

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0014: Bugfix — Missing Health Check Endpoint

Fixed `/healthz-smoke-cancel-bugfix-805287530` endpoint that was returning 404. Endpoint now returns `{ok:true, variant:"805287530"}`. Internal health check for smoke testing; no user-facing changes but ensures smoke test coverage.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

Added `/healthz-smoke-cancel-569985850` GET endpoint returning `{ok:true, variant:"569985850"}`. Self-contained, no auth/database, simple health check for smoke testing. Third example of minimal health check pattern.

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

Added `/healthz-smoke-cancel-158110053` GET endpoint returning `{ok:true, variant:"158110053"}`. Self-contained, no auth/database, simple health check for smoke testing. Second example of minimal health check pattern.

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

Added `/healthz-smoke-cancel-407995880` GET endpoint returning `{ok:true, variant:"407995880"}`. Self-contained, no auth/database, simple health check for smoke testing.

### 2026-07-26 — Bootstrap sprint

Initial project setup from the vortex-boilerplate-ts-reactjs-vite-tailwindcss template. Renamed project to vortex-smoke-test-bootstrap, updated homepage, added GitHub Actions CI workflow, documented root specs (AGENT/PRODUCT/ARCHITECTURE/DESIGN). Stack: React 19, Vite 8, Nitro 3, SQLite + Drizzle, Tailwind CSS v4, Vitest + Playwright.
