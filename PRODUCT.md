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

### 2026-07-26 — SPRINT-0001: Add independent health-check endpoints

Added 3 independent GET endpoints (`/healthz-smoke-136110581-a`, `/healthz-smoke-136110581-b`, `/healthz-smoke-136110581-c`) returning `{ok: true, variant: "136110581"}` each. Demonstrates lightweight service addition pattern: standalone endpoints with no shared code, no auth, no database. Documented sprint plan and test harness in artifacts/SPRINT-0001/.

### 2026-07-26 — Bootstrap sprint

Initial project setup from the vortex-boilerplate-ts-reactjs-vite-tailwindcss template. Renamed project to vortex-smoke-test-bootstrap, updated homepage, added GitHub Actions CI workflow, documented root specs (AGENT/PRODUCT/ARCHITECTURE/DESIGN). Stack: React 19, Vite 8, Nitro 3, SQLite + Drizzle, Tailwind CSS v4, Vitest + Playwright.
