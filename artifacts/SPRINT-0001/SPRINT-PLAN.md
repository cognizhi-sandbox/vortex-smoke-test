# Sprint Plan — SPRINT-0001

## Goal

Bootstrap a working **vortex-smoke-test-bootstrap** application from the provided boilerplate template, proving the stack runs end-to-end: builds, passes type-check/lint/unit tests, runs the app locally, and passes an E2E smoke test. Establish CI/CD baseline on `vortex/**` branches so all later sprints validate against it.

---

## Codebase Findings

The project was initialized from the **vortex-boilerplate-ts-reactjs-vite-tailwindcss** template and provides:

- **Frontend stack**: React 19, TypeScript 5 (strict), Vite 8, file-based routing via `vite-plugin-pages`, auto-imports for `react` and `react-router`
- **Backend**: Nitro 3 / H3, file-based API routes in `routes/api/`, middleware in `middleware/`, SQLite + Drizzle ORM with schema in `db/` and migrations in `drizzle/`
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.ts`), shadcn/ui-style primitives, custom design tokens in `src/index.css`
- **Test harness**: Vitest + React Testing Library (unit/component/UI), Playwright (~1.50.0 pinned) for E2E and smoke tests — all scripts in `package.json`
- **Existing tests**: Unit tests (`src/utils/cn.test.ts`, component tests in `src/components/ui/`), page tests (`src/pages/`), API route tests (`routes/api/`), E2E specs in `e2e/` including a working smoke test (`e2e/smoke.spec.ts`)
- **Linting & formatting**: ESLint 9 + typescript-eslint, Prettier, Husky + lint-staged
- **Build output**: Vite SPA bundle → `dist/`, Nitro server → `.output/server/`

**What we keep as-is**: All of the above. Bootstrap does NOT refactor the boilerplate — it proves it works and adds only naming/branding and CI.

**What we add**:

1. Rename `package.json` name from `react-ts-starter` to `vortex-smoke-test-bootstrap`
2. Update homepage title/description to match the project name
3. Add GitHub Actions CI workflow (`.github/workflows/ci.yml`) that runs on `vortex/**`, `dev`, and `main` branches — typecheck, lint, test, build

---

## Target State

After this sprint:

- **`AGENT.md`**: The agent operating manual. Sections: Build & run, Test & validate, Conventions, Gotchas, Doc map. Records CI commands (`bun run typecheck`, `lint`, `test`, `build`).
- **`PRODUCT.md`**: This IS a boilerplate — document the scope (starter kit for full-stack TS apps, proof-of-concept for Vortex infra), users (Vortex engineers + early adopters), included features (React SPA + Nitro API, file-based routing on both sides, test setup, Tailwind + shadcn style). Replace the placeholder.
- **`ARCHITECTURE.md`**: Document the SPA + Nitro split, Drizzle data model, H3 route contracts, constraints (serverDir config, bun:sqlite requires Bun runtime). Add a `## Key Decisions` section pinning the stack (React 19, Vite 8, Nitro 3, SQLite + Drizzle, Tailwind v4, shadcn-style primitives).
- **`DESIGN.md`**: Document the Tailwind v4 token system (OKLCH custom properties), theming (dark mode exists but no toggle yet), component pattern (CVA + Slot polymorphism), icons (lucide-react + @heroicons/react), animation (tw-animate-css).

Each doc gets a dated `## Changelog` section with an entry: `2026-07-26: Bootstrap sprint — initial project setup from boilerplate template.`

---

## Implementation Phases

### Phase 1: Project Naming & Branding

- Rename `package.json` `name` field from `react-ts-starter` to `vortex-smoke-test-bootstrap`
- Update homepage title in `src/pages/index.tsx` to reflect the project name (change "Vortex: the AI-driven..." to "vortex-smoke-test-bootstrap: ..."). Keep the tech stack display and layout.

### Phase 2: Configuration & Local Build Verification

- Ensure `vite.config.ts` nitro plugin has `serverDir: "./"` and `ignore: ["**/*.test.ts"]` (already present in template)
- Ensure `vitest.config.ts` has client/server project split for Bun/sqlite separation (already present)
- Ensure `playwright.config.ts` targets port 5178 (already present)
- Confirm build completes: `bun run build` → `dist/` + `.output/server/` both present, no errors

### Phase 3: Test Harness Validation

- Run unit tests: `bun run test` — ensure all existing tests pass (unit, component, API route tests)
- Confirm lint: `bun run lint` — no errors
- Confirm typecheck: `bun run typecheck` — no errors
- Run smoke test against dev server: `bun run test:smoke` — home page loads, no console errors

### Phase 4: CI Workflow Setup

- Create `.github/workflows/ci.yml` with:
  - Trigger: `push` and `pull_request` on branches `vortex/**`, `dev`, `main`
  - Setup: `oven-sh/setup-bun@v2` (or latest)
  - Install: `bun install`
  - Commands: `bun run typecheck && bun run lint && bun run test && bun run build`
  - Report: upload test results / build artifacts if needed
- Verify CI runs on the sprint branch and passes

### Phase 5: Root Docs Update

- Update `AGENT.md`: Add `## Build & run`, `## Test & validate`, `## Conventions`, `## Gotchas`, `## Doc map` sections per target state above
- Update `PRODUCT.md`: Replace placeholder with real scope (boilerplate, users, scope & non-goals, features)
- Update `ARCHITECTURE.md`: Document the stack, add `## Key Decisions` section
- Update `DESIGN.md`: Document tokens, theming, component pattern, icons
- Add dated `## Changelog` section to each: `2026-07-26: Bootstrap sprint — initial project setup from boilerplate template.`

---

## Ticket Map

| Phase     | Ticket           | Agent    |
| --------- | ---------------- | -------- |
| 1–5 (all) | VRTX-0002 (TASK) | Engineer |

Per BOOTSTRAP SPRINT OVERRIDE: all bootstrap acceptance criteria (naming, configuration, tests, CI) ship in ONE TASK. NO separate test, docs, or CI tickets.

---

## Risks & Assumptions

- **Assumption**: The boilerplate's build, test, and dev server setups are correct as-is and require no refactoring.
- **Risk**: GitHub Actions may have version/API changes — use `oven-sh/setup-bun@v2` (check GitHub Marketplace for latest).
- **Risk**: Playwright pinned to `~1.50.0` matches QA container Chromium — if a local dev machine has a different Chromium version, smoke test may fail; we assume the CI container + QA container have matching Chromium.
- **Assumption**: The project name `vortex-smoke-test-bootstrap` is final for this sprint; no further renames.

---

## Success Criteria

✅ All boilerplate dependencies install cleanly  
✅ `bun run typecheck` passes  
✅ `bun run lint` passes (no warnings)  
✅ `bun run test` passes (all unit/component/API tests)  
✅ `bun run build` completes with `dist/` and `.output/server/`  
✅ `bun run test:smoke` passes (home page loads, no errors, API responds)  
✅ `.github/workflows/ci.yml` created and triggers on `vortex/**` branches  
✅ CI workflow runs and passes on the sprint branch  
✅ Root docs updated with target-state content and dated changelog entries  
✅ All changes committed on ticket branch and sprint plan validated with `a2a_sprint_plan_checklist`
