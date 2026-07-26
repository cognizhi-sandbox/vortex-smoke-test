# Plan — VRTX-0013: Verify build, test, lint, CI

## Objective

Verify that all three health check endpoints (VRTX-0010, VRTX-0011, VRTX-0012) integrate correctly with the build system, test harness, and CI pipeline. This is the final verification gate before the sprint is complete.

**Dependency**: This TASK runs after VRTX-0010, VRTX-0011, and VRTX-0012 are all implemented and committed.

---

## Verification Steps

### 1. Local Typecheck

```bash
bun run typecheck
```

**Expected**: All TypeScript code compiles with no errors or warnings.

**Verification**:

- ✅ No type errors in the three new route files (`routes/api/healthz-smoke-126862920-{a|b|c}.ts`)
- ✅ No type errors in the three new test files (`routes/api/healthz-smoke-126862920-{a|b|c}.test.ts`)
- ✅ No type errors in any existing code (unchanged)

### 2. Local Lint

```bash
bun run lint
```

**Expected**: ESLint 9 + typescript-eslint + Prettier report zero warnings.

**Verification**:

- ✅ No linting issues in new route files
- ✅ No linting issues in new test files
- ✅ No formatting issues (Prettier auto-fix any spacing/quote issues)

### 3. Local Test Suite

```bash
bun run test
```

**Expected**: All unit, component, API integration, and new health check tests pass.

**Verification**:

- ✅ All existing tests still pass (no regression)
- ✅ `routes/api/healthz-smoke-126862920-a.test.ts` passes (2 tests from VRTX-0010)
- ✅ `routes/api/healthz-smoke-126862920-b.test.ts` passes (2 tests from VRTX-0011)
- ✅ `routes/api/healthz-smoke-126862920-c.test.ts` passes (2 tests from VRTX-0012)
- ✅ Total test count increases by 6 (3 routes × 2 tests each)

### 4. Production Build

```bash
bun run build
```

**Expected**: Build completes successfully with no errors.

**Verification**:

- ✅ `dist/` directory exists and contains static files (HTML, JS, CSS)
- ✅ `.output/server/index.mjs` exists and is > 1MB (contains Nitro server + all routes)
- ✅ No build errors or warnings
- ✅ Nitro auto-discovery includes all three new routes

### 5. Manual Endpoint Verification (Dev Server)

**Setup**:

```bash
bun run dev
```

**In separate terminal, test each endpoint**:

```bash
curl http://localhost:5000/api/healthz-smoke-126862920-a
curl http://localhost:5000/api/healthz-smoke-126862920-b
curl http://localhost:5000/api/healthz-smoke-126862920-c
```

**Expected response from each**:

```json
{ "ok": true, "variant": "126862920" }
```

**Verification**:

- ✅ Each endpoint returns HTTP 200
- ✅ Response body is exactly `{"ok":true,"variant":"126862920"}`
- ✅ No timeouts or connection errors
- ✅ Response time is instant (< 100ms, typically < 1ms)

### 6. CI Validation

**Setup**:

1. Ensure all changes from VRTX-0010, VRTX-0011, VRTX-0012 are committed and pushed
2. GitHub Actions workflow (`.github/workflows/ci.yml` from SPRINT-0001) automatically runs on push

**Expected CI steps**:

1. `bun install` — dependencies resolve
2. `bun run typecheck` — no type errors (includes new routes)
3. `bun run lint` — no linting errors (includes new routes)
4. `bun run test` — all tests pass (includes 6 new health check tests)
5. `bun run build` — production build succeeds (includes new routes in Nitro bundle)

**Verification**:

- ✅ All CI steps show ✅ in GitHub Actions UI
- ✅ Workflow completes in ~2-3 minutes
- ✅ No failures or warnings
- ✅ Commit SHA shows "All checks passed"

---

## File/Module Ownership

This TASK reads (verifies):

| File/Path                                      | Purpose                              |
| ---------------------------------------------- | ------------------------------------ |
| `routes/api/healthz-smoke-126862920-a.ts`      | Verify implementation from VRTX-0010 |
| `routes/api/healthz-smoke-126862920-a.test.ts` | Verify tests from VRTX-0010          |
| `routes/api/healthz-smoke-126862920-b.ts`      | Verify implementation from VRTX-0011 |
| `routes/api/healthz-smoke-126862920-b.test.ts` | Verify tests from VRTX-0011          |
| `routes/api/healthz-smoke-126862920-c.ts`      | Verify implementation from VRTX-0012 |
| `routes/api/healthz-smoke-126862920-c.test.ts` | Verify tests from VRTX-0012          |
| `vite.config.ts`                               | Verify Nitro config (read-only)      |
| `vitest.config.ts`                             | Verify test config (read-only)       |
| `.github/workflows/ci.yml`                     | Verify CI workflow (read-only)       |

**No modifications by this TASK** — purely verification.

**Dependencies**:

- VRTX-0010 must be complete (endpoint A route + test)
- VRTX-0011 must be complete (endpoint B route + test)
- VRTX-0012 must be complete (endpoint C route + test)

---

## Definition of Done

✅ `bun run typecheck` passes (no errors, includes all three new endpoints)  
✅ `bun run lint` passes (zero warnings, includes all three new endpoints)  
✅ `bun run test` passes (all 6 new health check tests pass + no regression in existing tests)  
✅ `bun run build` succeeds (dist/ and .output/server/index.mjs with all routes)  
✅ Manual `curl` tests confirm all three endpoints respond correctly (HTTP 200, correct JSON, < 100ms)  
✅ GitHub Actions CI passes on sprint branch (all steps: install, typecheck, lint, test, build)  
✅ All verification results documented or noted in ticket comments  
✅ `artifacts/SPRINT-0002/VRTX-0013/PLAN.md` committed
