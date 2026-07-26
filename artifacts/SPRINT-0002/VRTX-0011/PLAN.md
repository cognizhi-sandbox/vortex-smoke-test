# Plan — VRTX-0011: Verify build, test, CI; update root documentation

## Objective

Verify that all three health check endpoints (VRTX-0008, VRTX-0009, VRTX-0010) integrate correctly with the build system, test harness, and CI pipeline. Update root documentation (AGENT.md, PRODUCT.md, ARCHITECTURE.md) to reflect the independent endpoint pattern and document it for future sprints.

**Dependency**: This TASK depends on VRTX-0008, VRTX-0009, and VRTX-0010 being complete (all three routes + tests implemented).

---

## Implementation Steps

### Phase 1: Integration & Verification (runs after VRTX-0008/9/10 are committed)

#### 1.1 Typecheck Validation

```bash
bun run typecheck
```

**Expected**: All TypeScript code (including the three new route files and tests) compiles with no errors or warnings.

**Verification**:

- No type errors in `routes/api/healthz-smoke-126862920-{a|b|c}.ts`
- No type errors in `routes/api/healthz-smoke-126862920-{a|b|c}.test.ts`
- No type errors in any existing code (unchanged)

#### 1.2 Lint Validation

```bash
bun run lint
```

**Expected**: ESLint 9 + typescript-eslint + Prettier report zero warnings.

**Verification**:

- No linting issues in new route files
- No linting issues in new test files
- No formatting issues (Prettier auto-fix any spacing/quote issues)

#### 1.3 Unit/Integration Test Suite

```bash
bun run test
```

**Expected**: All unit, component, API integration, and new health check tests pass.

**Verification**:

- ✅ All existing tests still pass (no regression)
- ✅ `routes/api/healthz-smoke-126862920-a.test.ts` passes (2 tests)
- ✅ `routes/api/healthz-smoke-126862920-b.test.ts` passes (2 tests)
- ✅ `routes/api/healthz-smoke-126862920-c.test.ts` passes (2 tests)
- ✅ Total test count increases by 6 (3 routes × 2 tests each)

#### 1.4 Production Build

```bash
bun run build
```

**Expected**: Build completes successfully with no errors.

**Verification**:

- ✅ `dist/` directory exists and contains static files (HTML, JS, CSS)
- ✅ `.output/server/index.mjs` exists
- ✅ No build errors or warnings
- ✅ Nitro auto-discovery includes the three new routes

#### 1.5 Manual Endpoint Verification (Dev Server)

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

---

### Phase 2: Update Root Documentation

#### 2.1 Update AGENT.md

**Location**: `/workspace/repo/AGENT.md`

**Changes**:

1. Add a new section after the "Adding Tests" section:

````markdown
## Independent Health Check Endpoints

When you need to add a simple, lightweight GET endpoint (health checks, liveness probes, etc.) with no dependencies:

1. Create a route file at `routes/api/healthz-<name>.ts`:

   ```typescript
   import { defineHandler } from "nitro/h3";

   export default defineHandler((event) => {
     return { ok: true };
   });
   ```
````

2. Create a test file at `routes/api/healthz-<name>.test.ts` (copy from `routes/api/healthz-smoke-126862920-a.test.ts`):

   ```typescript
   import { H3Event } from "nitro/h3";
   import { describe, expect, it } from "vitest";
   import handler from "./healthz-<name>";

   describe("GET /api/healthz-<name>", () => {
     it("returns HTTP 200 with correct response", async () => {
       const event = new H3Event(new Request("http://localhost/api/healthz-<name>"));
       const result = await handler(event);
       expect(result).toEqual({ ok: true });
     });
   });
   ```

3. Run `bun run typecheck && bun run lint && bun run test` to verify.

4. Each endpoint is independently deployable — no shared code overhead.

````

2. Update the `## Changelog` section in AGENT.md:

```markdown
### 2026-07-27 — Health check endpoints sprint

Added independent `/api/healthz-smoke-126862920-{a|b|c}` endpoints demonstrating parallel deployment model. Documented simple health check endpoint pattern for future sprints — no shared code, no dependencies, each endpoint independently deployable.
````

**Verification**: Section is clear, example code is correct, referenced test file exists.

#### 2.2 Update PRODUCT.md

**Location**: `/workspace/repo/PRODUCT.md`

**Changes**:

1. In the "Scope → Included" section, find the line starting with `- **Backend**:` and add to it:

```markdown
- **Backend**: Nitro 3 server with file-based API routes (including independent health check endpoints for parallel development), SQLite persistence via Drizzle ORM, middleware support
```

Or update the existing line to emphasize independent route development.

2. In the "Users" section, optionally add:

```markdown
- **Distributed teams** — develop endpoints in parallel without shared code coordination overhead
```

3. Update the `## Changelog` section:

```markdown
### 2026-07-27 — Health check endpoints sprint

Added three independent health check endpoints (`/api/healthz-smoke-126862920-{a|b|c}`) demonstrating that the Nitro backend supports parallel endpoint development. Each endpoint is independently deployable with no shared infrastructure.
```

**Verification**: Scope description reflects the capability of independent endpoint development.

#### 2.3 Update ARCHITECTURE.md

**Location**: `/workspace/repo/ARCHITECTURE.md`

**Changes**:

1. In the "Routing" section, add a paragraph after the existing routing documentation:

```markdown
## Independent Routes Model

Each `routes/api/*.ts` file is a completely independent unit. Nitro's file-based routing automatically discovers, loads, and exposes each route as `/api/*` with no shared code paths required. This enables parallel development and deployment:

- Teams can work on different endpoints simultaneously with zero file overlap.
- An endpoint can be deployed or modified without affecting others.
- No shared helpers, utilities, or middleware are required (middleware is optional and runs globally if needed).
- Example: `/api/healthz-smoke-126862920-{a|b|c}` endpoints were developed in parallel, each with identical response structure but no shared code.

This model is particularly useful for health checks, status probes, and feature flags — lightweight endpoints that fit one-off response contracts.
```

2. In the "Key Decisions" table, add a row:

```markdown
| **Independent route model** | Routes are isolated units; automatic Nitro discovery enables parallel development and independent deployment without shared infrastructure overhead |
```

3. Update the `## Changelog` section:

```markdown
### 2026-07-27 — Health check endpoints sprint

Documented independent routes model — each `routes/api/*.ts` is a fully isolated deployable unit. No shared code paths required. Added three health check endpoint examples (`/api/healthz-smoke-126862920-{a|b|c}`) demonstrating parallel development. Teams can work on different endpoints in parallel and deploy independently.
```

**Verification**: Documentation is clear, examples are accurate, Key Decisions table is updated.

#### 2.4 DESIGN.md (No Changes)

No changes needed. DESIGN.md covers styling and visual design, not API response formats.

---

### Phase 3: Git Commit & Push

#### 3.1 Stage All Changes

```bash
git add \
  artifacts/SPRINT-0002/SPRINT-PLAN.md \
  artifacts/SPRINT-0002/VRTX-0008/PLAN.md \
  artifacts/SPRINT-0002/VRTX-0009/PLAN.md \
  artifacts/SPRINT-0002/VRTX-0010/PLAN.md \
  artifacts/SPRINT-0002/VRTX-0011/PLAN.md \
  AGENT.md \
  PRODUCT.md \
  ARCHITECTURE.md
```

#### 3.2 Commit with Clear Message

```bash
git commit -m "SPRINT-0002: Add independent health check endpoints; document parallel deployment model

- Implement /api/healthz-smoke-126862920-{a|b|c} endpoints
- Each endpoint is independent (no shared code)
- Demonstrate parallel development and deployment capability
- Update AGENT.md with health check endpoint pattern
- Update PRODUCT.md and ARCHITECTURE.md to document independent routes model
- All tests pass (typecheck, lint, test, build)
"
```

#### 3.3 Push to Ticket Branch

```bash
git push -u origin vortex/feat/VRTX-0007-sprint-plan-sprint-0002-d9a1be1b
```

#### 3.4 Verify CI

- GitHub Actions workflow (`.github/workflows/ci.yml` from SPRINT-0001) runs automatically on push
- Expected: `bun install`, `bun run typecheck`, `bun run lint`, `bun run test`, `bun run build` all pass
- Verify all steps show ✅ in GitHub Actions UI

---

## File/Module Ownership

This TASK modifies:

| File/Path                                 | Operation | Notes                                       |
| ----------------------------------------- | --------- | ------------------------------------------- |
| `AGENT.md`                                | Modify    | Add health check endpoint pattern section   |
| `PRODUCT.md`                              | Modify    | Update scope to reflect parallel capability |
| `ARCHITECTURE.md`                         | Modify    | Add "Independent Routes Model" section      |
| `artifacts/SPRINT-0002/VRTX-0011/PLAN.md` | Create    | This plan document                          |

**No other TASKs should modify these files** during this sprint. Documentation updates are exclusive to VRTX-0011.

**No file overlap with other TASKs**: VRTX-0008/9/10 create route and test files only; VRTX-0011 modifies docs only.

---

## Definition of Done

✅ `bun run typecheck` passes (no errors)  
✅ `bun run lint` passes (zero warnings)  
✅ `bun run test` passes (all unit, component, API, health check tests)  
✅ `bun run build` succeeds (`dist/` and `.output/server/index.mjs`)  
✅ Manual `curl` tests confirm all three health check endpoints respond correctly  
✅ AGENT.md updated with health check endpoint pattern + dated changelog entry  
✅ PRODUCT.md updated to reflect parallel endpoint development capability + dated changelog entry  
✅ ARCHITECTURE.md updated with "Independent Routes Model" section + Key Decisions row + dated changelog entry  
✅ All doc files committed on ticket branch  
✅ GitHub Actions CI passes on sprint branch  
✅ `artifacts/SPRINT-0002/VRTX-0011/PLAN.md` committed  
✅ All changes pushed to origin ticket branch
