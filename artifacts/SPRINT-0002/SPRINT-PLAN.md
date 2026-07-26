# Sprint Plan — SPRINT-0002

## Goal

Add three independent health check API endpoints (`/api/healthz-smoke-126862920-{a|b|c}`) as standalone, deployable units. Demonstrate that the Nitro routing system supports parallel development of unrelated endpoints with zero shared code or infrastructure dependencies.

---

## Codebase Findings

The project uses **Nitro 3 / H3** for backend routing with file-based API routes:

- **Backend routing**: `routes/api/*.ts` → `/api/*` paths, automatically scanned by Nitro (via `nitro({ serverDir: "./" })` in `vite.config.ts`)
- **Route structure**: Each route file is a default export of an H3 handler (e.g., `routes/api/hello.ts` exports `defineHandler((event) => { ... })`)
- **No shared infrastructure**: Routes are independent; middleware (`middleware/auth.ts`) runs globally but these endpoints will not require it
- **Existing test pattern**: API routes have integration tests using real `H3Event` objects (see `routes/api/hello.test.ts`)
- **Testing**: Vitest + H3Event pattern; tests run in Node environment with `VITEST=true` flag

**What we keep as-is**: All existing infrastructure, routing setup, build configuration, and test harness.

**What we add**:

1. Three new route files: `routes/api/healthz-smoke-126862920-a.ts`, `routes/api/healthz-smoke-126862920-b.ts`, `routes/api/healthz-smoke-126862920-c.ts`
2. Three corresponding test files: `routes/api/healthz-smoke-126862920-{a|b|c}.test.ts`
3. Each endpoint responds with `{ ok: true, variant: "126862920" }` in under 100ms, no dependencies

---

## Target State

After this sprint:

- **`AGENT.md`**: Add a section documenting simple endpoint patterns — reference the healthz endpoints as an example of standalone routes that need no shared helpers. Record the pattern for quickly adding new health-check or probe endpoints.
- **`PRODUCT.md`**: Extend the scope description to note that the system supports independent endpoint development and deployment (useful for teams working in parallel).
- **`ARCHITECTURE.md`**: Document the route independence model — explain that `routes/api/*.ts` files are loaded and exposed automatically with no required shared code paths; each is a deployable unit.
- **`DESIGN.md`**: No changes needed (design system covers styling, not API responses).

Each doc gets an updated dated `## Changelog` section: `2026-07-27: Health check endpoints sprint — add three independent `/api/healthz-smoke-126862920-{a|b|c}` endpoints demonstrating parallel deployment model.`

---

## Implementation Phases

### Phase 1: Route Implementation

**Objective**: Implement three standalone health check endpoints.

**Steps**:

1. Create `routes/api/healthz-smoke-126862920-a.ts` — GET handler returning `{ ok: true, variant: "126862920" }`
2. Create `routes/api/healthz-smoke-126862920-b.ts` — same structure, no shared code
3. Create `routes/api/healthz-smoke-126862920-c.ts` — same structure, no shared code
4. Each uses `defineHandler((event) => { ... })` pattern (see `routes/api/hello.ts`)
5. No middleware dependencies, no database access, no authentication
6. Response time must be < 100ms (verify with simple timing assertions)

**Deliverable**: Three route files, no shared code paths

---

### Phase 2: API Integration Tests

**Objective**: Test each endpoint independently.

**Steps**:

1. Create `routes/api/healthz-smoke-126862920-a.test.ts` using the `H3Event` + direct handler pattern (see `routes/api/hello.test.ts`)
2. Create `routes/api/healthz-smoke-126862920-b.test.ts` with the same pattern
3. Create `routes/api/healthz-smoke-126862920-c.test.ts` with the same pattern
4. Each test verifies:
   - HTTP 200 response
   - Response body is exactly `{ ok: true, variant: "126862920" }`
   - Response time < 100ms

**Deliverable**: Three test files, one test per endpoint

---

### Phase 3: Typecheck & Lint Validation

**Objective**: Ensure all new code passes the verification gates.

**Steps**:

1. Run `bun run typecheck` — all new routes must compile with no errors
2. Run `bun run lint` — ESLint 9 + typescript-eslint must pass with zero warnings
3. Fix any errors or warnings before proceeding

**Deliverable**: All verification gates pass

---

### Phase 4: Test Harness Validation

**Objective**: Verify all tests pass and the endpoints work end-to-end.

**Steps**:

1. Run `bun run test` — all API tests (including new health check tests) must pass
2. Start dev server: `bun run dev` (in background)
3. Manually test each endpoint:
   - `curl http://localhost:5000/api/healthz-smoke-126862920-a` → expect `{"ok":true,"variant":"126862920"}`
   - `curl http://localhost:5000/api/healthz-smoke-126862920-b` → expect `{"ok":true,"variant":"126862920"}`
   - `curl http://localhost:5000/api/healthz-smoke-126862920-c` → expect `{"ok":true,"variant":"126862920"}`
4. Verify response times are well under 100ms

**Deliverable**: All endpoints responding correctly, all tests passing

---

### Phase 5: CI Validation

**Objective**: Ensure the CI workflow passes.

**Steps**:

1. Commit all changes to the ticket branch
2. Push to origin
3. GitHub Actions workflow (`.github/workflows/ci.yml`) automatically runs:
   - `bun install` — dependencies resolve
   - `bun run typecheck` — types check
   - `bun run lint` — linting passes
   - `bun run test` — all tests pass (including new health check tests)
   - `bun run build` — production build succeeds
4. Verify CI workflow passes on the sprint branch

**Deliverable**: Green CI on sprint branch

---

### Phase 6: Root Docs Update

**Objective**: Document the independent endpoint pattern for future sprints.

**Steps**:

1. Update `AGENT.md`:
   - Add a section "Simple Health Check Endpoints" showing how to add a new GET endpoint with no dependencies
   - Reference `routes/api/healthz-smoke-126862920-a.ts` as an example
   - Show the test pattern from `routes/api/healthz-smoke-126862920-a.test.ts`
2. Update `PRODUCT.md`:
   - Extend scope section to note: "The backend supports independent API endpoint development — multiple teams can work on endpoints in parallel without shared code overhead."
3. Update `ARCHITECTURE.md`:
   - Add section "Independent Routes Model": explain that each `routes/api/*.ts` file is automatically scanned, exposed as `/api/*`, and requires no shared infrastructure
   - Document that this enables parallel deployment: one endpoint can ship without waiting for others
4. Update all three with dated changelog entry

**Deliverable**: Root docs updated, committed

---

## Ticket Map

| Ticket    | Type  | Title                                              | Parent    | Agent    | Notes                                      |
| --------- | ----- | -------------------------------------------------- | --------- | -------- | ------------------------------------------ |
| VRTX-0008 | EPIC  | Health check endpoints: parallel deployment model  | (root)    | Product  | Epic grouping this sprint's work           |
| VRTX-0009 | STORY | Implement three independent health check endpoints | VRTX-0008 | Product  | Container story for the three endpoints    |
| VRTX-0010 | TASK  | Implement health check endpoint variant A          | VRTX-0009 | Engineer | Route + test, no dependencies              |
| VRTX-0011 | TASK  | Implement health check endpoint variant B          | VRTX-0009 | Engineer | Route + test, independent from A           |
| VRTX-0012 | TASK  | Implement health check endpoint variant C          | VRTX-0009 | Engineer | Route + test, independent from A & B       |
| VRTX-0013 | TASK  | Verify build, test, lint, CI                       | VRTX-0009 | Engineer | Depends on VRTX-0010, VRTX-0011, VRTX-0012 |

**Decomposition rationale**:

- **VRTX-0008 (EPIC)**: Groups all work for this sprint
- **VRTX-0009 (STORY)**: Container story for the three independent endpoints
- **VRTX-0010/11/12 (TASKs)**: Each endpoint is truly independent (no shared code, no file overlap). Separate TASKs allow parallel development and deployment.
- **VRTX-0013 (TASK)**: Verification gate. Depends on all three endpoints being implemented. Verifies all tests pass and CI succeeds.

---

## Test Harness & CI Strategy

### Test Harness Phases

1. **Unit/Integration Tests** (`bun run test`):
   - Three new test files in `routes/api/healthz-smoke-126862920-{a|b|c}.test.ts`
   - Each tests HTTP 200, correct response body, response time < 100ms
   - Pattern: `H3Event` direct handler call (no HTTP server), same as existing `routes/api/hello.test.ts`

2. **Typecheck** (`bun run typecheck`):
   - TypeScript 5 strict mode on all new routes
   - No errors or warnings

3. **Lint** (`bun run lint`):
   - ESLint 9 + typescript-eslint + Prettier
   - Zero warnings

4. **Build** (`bun run build`):
   - Vite SPA bundle → `dist/`
   - Nitro server → `.output/server/index.mjs`
   - Routes automatically scanned and included in bundle

5. **Smoke/E2E** (optional in this sprint):
   - Manual `curl` tests against dev server
   - Could be extended to Playwright specs in future sprints

### CI Pipeline (`.github/workflows/ci.yml`)

**Already in place** from SPRINT-0001:

- Triggers on `push` and `pull_request` to `vortex/**`, `dev`, `main` branches
- Runs: `bun install`, `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build`
- No changes needed; CI automatically picks up new test files

**No additional CI configuration needed** — Nitro auto-discovery and Vitest file scanning handle the new routes and tests.

---

## Risks & Assumptions

- **Assumption**: Each endpoint can be implemented identically with no shared helpers. If future requirements demand a shared response formatter, TASKs should be sequenced with `depends_on` and a helper utility created in Phase 5 (after all three endpoints are reviewed).
- **Risk**: Response time requirements (< 100ms). Nitro handlers are fast, but if there's unexpected latency, check for:
  - Middleware overhead (currently none for these endpoints)
  - Slow event.context access
  - Database queries (there are none in this sprint)
  - Serialization overhead (JSON.stringify is fast for simple objects)
- **Assumption**: The project name `vortex-smoke-test-bootstrap` is stable; no rename needed for this sprint.
- **Assumption**: CI workflow from SPRINT-0001 remains stable; no GitHub Actions changes needed.

---

## Success Criteria

✅ `routes/api/healthz-smoke-126862920-a.ts` exists and returns `{"ok":true,"variant":"126862920"}` on GET  
✅ `routes/api/healthz-smoke-126862920-b.ts` exists and returns `{"ok":true,"variant":"126862920"}` on GET  
✅ `routes/api/healthz-smoke-126862920-c.ts` exists and returns `{"ok":true,"variant":"126862920"}` on GET  
✅ Each endpoint responds in under 100ms (verified in tests)  
✅ Test files `routes/api/healthz-smoke-126862920-{a|b|c}.test.ts` cover all endpoints  
✅ `bun run typecheck` passes (no errors)  
✅ `bun run lint` passes (zero warnings)  
✅ `bun run test` passes (all unit/component/API tests, including new health check tests)  
✅ `bun run build` succeeds (dist/ and .output/server/index.mjs)  
✅ CI workflow passes on sprint branch  
✅ Root docs (AGENT.md, PRODUCT.md, ARCHITECTURE.md) updated with changelog entries  
✅ All changes committed on ticket branch  
✅ `a2a_sprint_plan_checklist` passes with no blockers
