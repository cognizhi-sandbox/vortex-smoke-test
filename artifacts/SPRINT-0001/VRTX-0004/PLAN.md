# Plan — VRTX-0004: Implement bootstrap project setup: rename, config, tests, CI, docs

## Objective

Implement the complete bootstrap setup for vortex-smoke-test-bootstrap: rename the project, update the homepage to reflect the project name, verify all build/typecheck/lint/test gates pass, set up a GitHub Actions CI workflow that validates the stack on `vortex/**` branches, and ensure end-to-end delivery is working (dev server → home page → smoke test passing).

---

## Steps

### 1. Project Naming & Branding (package.json + homepage)

1. **Edit `package.json`**:
   - Change `"name": "react-ts-starter"` to `"name": "vortex-smoke-test-bootstrap"`
   - (Keep other fields as-is)

2. **Edit `src/pages/index.tsx`**:
   - Locate the `<h1>` tag (line ~135)
   - Replace `"Vortex: the AI-driven autonomous software factory"` with a title that reflects vortex-smoke-test-bootstrap (e.g., "vortex-smoke-test-bootstrap: Full-stack TypeScript on day one")
   - Keep the tech stack display and layout intact
   - Verify the heading renders as an `<h1>` for smoke test assertion

### 2. Local Build & Verification

1. **Install dependencies** (if not already done):

   ```bash
   bun install
   ```

2. **Run typecheck**:

   ```bash
   bun run typecheck
   ```

   - Should complete with no errors

3. **Run lint**:

   ```bash
   bun run lint
   ```

   - Should pass with zero warnings

4. **Run unit/component/API tests**:

   ```bash
   bun run test
   ```

   - All existing tests in `src/` and `routes/api/` should pass

5. **Run production build**:

   ```bash
   bun run build
   ```

   - Should complete successfully
   - Verify `dist/` directory exists and is not empty
   - Verify `.output/server/index.mjs` exists

6. **Start dev server** (for smoke test):

   ```bash
   bun run dev
   ```

   - Backend and frontend should start cleanly on port 5000

7. **Run smoke test** (in separate terminal or after stopping dev server):
   ```bash
   bun run test:smoke
   ```

   - Should pass all assertions: home page loads, h1 visible, no console errors, API responds
   - All test passes indicate the stack is working end-to-end

### 3. GitHub Actions CI Workflow

1. **Create `.github/workflows/` directory** (if it doesn't exist)

2. **Create `.github/workflows/ci.yml`**:

   ```yaml
   name: CI

   on:
     push:
       branches: ["vortex/**", dev, main]
     pull_request:
       branches: ["vortex/**", dev, main]

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v4

         - name: Setup Bun
           uses: oven-sh/setup-bun@v2

         - name: Install dependencies
           run: bun install

         - name: Typecheck
           run: bun run typecheck

         - name: Lint
           run: bun run lint

         - name: Test
           run: bun run test

         - name: Build
           run: bun run build
   ```

3. **Verify CI triggers**: Push the sprint branch to origin and confirm GitHub Actions runs the workflow and passes all steps.

### 4. Verification & Testing

1. **Local verification gate**:

   ```bash
   bun run verify
   ```

   - Runs lint + typecheck + test
   - Should pass

2. **Full verification (if Chromium available)**:

   ```bash
   bun run verify:full
   ```

   - Runs verify + E2E (smoke test)
   - Should pass

3. **Smoke test details**:
   - `e2e/smoke.spec.ts` already exists and tests:
     - Home page loads (HTTP 200 response)
     - Main `<h1>` heading is visible
     - No console errors logged
     - `/api/hello` endpoint responds
   - All assertions should pass with the homepage updated

### 5. Git Commit & Push

1. **Stage all changes**:

   ```bash
   git add package.json src/pages/index.tsx .github/workflows/ci.yml artifacts/SPRINT-0001/
   ```

2. **Commit with a clear message**:

   ```bash
   git commit -m "Bootstrap vortex-smoke-test-bootstrap: rename project, update homepage, add CI workflow"
   ```

3. **Push to the ticket branch**:

   ```bash
   git push -u origin vortex/feat/VRTX-0001-bootstrap-plan-sprint-0001-<hash>
   ```

4. **Verify CI runs**: Check GitHub Actions workflow runs and passes on the sprint branch.

---

## File/Module Ownership

This TASK creates or modifies:

| File/Path                                 | Operation      | Notes                                      |
| ----------------------------------------- | -------------- | ------------------------------------------ |
| `package.json`                            | Modify         | Change name to vortex-smoke-test-bootstrap |
| `src/pages/index.tsx`                     | Modify         | Update homepage title and description      |
| `.github/workflows/ci.yml`                | Create         | GitHub Actions workflow                    |
| `artifacts/SPRINT-0001/SPRINT-PLAN.md`    | Already exists | Created in planning phase                  |
| `artifacts/SPRINT-0001/VRTX-0004/PLAN.md` | Create         | This plan document                         |

**No other TASKs should modify these files** during this sprint. If a parallel TASK needs to touch these, sequence with `depends_on`.

---

## Interface Contracts

### Fixed Interfaces (Do Not Change)

1. **`package.json`**:
   - `"name"` MUST be exactly `"vortex-smoke-test-bootstrap"`
   - Keep `"version"`, `"type"`, `"scripts"`, `"dependencies"`, `"devDependencies"` as-is

2. **`src/pages/index.tsx`**:
   - MUST export a default React component
   - MUST contain an `<h1>` element as the main heading (required by smoke test assertion `getByRole("heading", { level: 1 })`)
   - Can modify title text and description; do NOT remove the heading

3. **`.github/workflows/ci.yml`**:
   - MUST trigger on `push` and `pull_request` to branches `vortex/**`, `dev`, `main`
   - MUST run: `bun install`, `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build` in that order
   - MUST use `oven-sh/setup-bun@v2` (or latest) to set up Bun environment

4. **Smoke Test (`e2e/smoke.spec.ts`)**:
   - MUST NOT modify; already working as-is
   - Verifies: home page loads, h1 visible, no console errors, /api/hello responds

---

## Definition of Done

✅ `package.json` name is `"vortex-smoke-test-bootstrap"`  
✅ `src/pages/index.tsx` homepage title reflects project name  
✅ `bun run typecheck` passes (no errors)  
✅ `bun run lint` passes (zero warnings)  
✅ `bun run test` passes (all unit/component/API tests)  
✅ `bun run build` succeeds (dist/ and .output/server/ exist)  
✅ `bun run test:smoke` passes (all Playwright assertions pass)  
✅ `.github/workflows/ci.yml` created with correct trigger branches  
✅ CI workflow runs on sprint branch and passes all steps  
✅ All changes committed on ticket branch (vortex/feat/VRTX-0001-...)  
✅ `artifacts/SPRINT-0001/VRTX-0004/PLAN.md` committed

---

## Test Plan

### Unit/Component/API Tests (`bun run test`)

- **Existing tests to verify**:
  - `src/utils/cn.test.ts` — utility function
  - `src/components/ui/button.test.tsx` — component rendering
  - `src/pages/index.test.tsx` — homepage component (may need update if content changed significantly)
  - `routes/api/hello.test.ts` — API route
  - `routes/api/users/[id].test.ts` — dynamic API route with DB query
- **Expected outcome**: All tests pass (no failures, no skipped tests)

### Typecheck & Lint

- **`bun run typecheck`** — TypeScript strict mode on full project
  - **Expected**: No errors
- **`bun run lint`** — ESLint 9 + typescript-eslint + Prettier
  - **Expected**: Zero warnings, pass with exit code 0

### Production Build (`bun run build`)

- **Vite SPA build**:
  - **Expected**: `dist/` folder contains static files (HTML, JS, CSS)
- **Nitro server build**:
  - **Expected**: `.output/server/index.mjs` exists and is runnable under Bun
- **Verify no build errors** in either output

### Smoke Test (`bun run test:smoke`)

- **Setup**: Dev server running (`bun run dev` in background)
- **Test assertions** (in `e2e/smoke.spec.ts`):
  1. `page.goto("/")` returns HTTP 200
  2. `getByRole("heading", { level: 1 })` is visible (homepage h1)
  3. No console errors logged during page load
  4. `GET /api/hello` responds with HTTP 200
- **Expected outcome**: All assertions pass, no timeouts, no failures

### CI Workflow (`GitHub Actions`)

- **Trigger**: Push to sprint branch `vortex/sprint/sprint-0001-*`
- **Environment**: Ubuntu latest, Bun runtime
- **Steps**:
  1. `bun install` — dependencies resolved
  2. `bun run typecheck` — no type errors
  3. `bun run lint` — no linting errors
  4. `bun run test` — all tests pass
  5. `bun run build` — builds successfully
- **Expected outcome**: All steps pass (green checkmark), workflow completes in ~2-3 minutes

### Integration: Full Verification (`bun run verify:full`)

- Runs all verification gates + smoke test (if Chromium available)
- **Expected**: All pass
- **If Chromium unavailable**: Fall back to `bun run verify` (lint + typecheck + test)

---

## Rollback & Recovery

If any step fails:

1. **Typecheck fails**: Check for TypeScript errors in `src/` or `routes/`; review changed code for type mismatches
2. **Lint fails**: Run `bun run lint` with specific rule errors; check `.eslintrc.js` and `.prettierrc.json` configs
3. **Test fails**: Run `bun run test` to see which test failed; update or fix test code
4. **Build fails**: Check for missing imports or syntax errors; review recent changes to `src/`, `routes/`, or config files
5. **Smoke test fails**:
   - If "home page loads" fails, check dev server is running and port 5000 is accessible
   - If "h1 visible" fails, verify homepage has an `<h1>` element
   - If "console errors" fails, check browser console for JavaScript errors on homepage
   - If "API responds" fails, check `/api/hello` route is working (run `curl http://localhost:5000/api/hello`)

To recover:

- Fix the issue locally
- Re-run the failing command
- Once passing, commit and push
- Re-run CI to confirm
