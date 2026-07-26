# SPRINT-0019 Plan — Three Independent Health Check Endpoints

**Sprint Goal**: Add three simple, self-contained GET endpoints for health checks with variant tracking, enabling parallel endpoint development.

**Idea**: VST-0025 — [smoke-178508469237747] 3 independent endpoints (302960562)

---

## Summary

This sprint adds three HTTP GET endpoints to the running service, each returning a tiny JSON object with an `ok` field set to `true` and a `variant` field set to the string `"302960562"`. The endpoints are:

- `/api/healthz-smoke-302960562-a`
- `/api/healthz-smoke-302960562-b`
- `/api/healthz-smoke-302960562-c`

All three are self-contained with no dependencies, no auth, no database access, and no side effects. They are completely independent and can be built in parallel, serving as a reference pattern for adding multiple endpoints without a full planning cycle.

### Acceptance Criteria

- ✅ GET `/api/healthz-smoke-302960562-a` returns HTTP 200 with response `{ok:true, variant:"302960562"}`
- ✅ GET `/api/healthz-smoke-302960562-b` returns HTTP 200 with response `{ok:true, variant:"302960562"}`
- ✅ GET `/api/healthz-smoke-302960562-c` returns HTTP 200 with response `{ok:true, variant:"302960562"}`
- ✅ Each endpoint is defined as a standalone `.ts` file under `routes/api/` with no shared imports or helper utilities between them
- ✅ No middleware (auth, logging, rate-limiting) is applied to any of these three endpoints
- ✅ All three endpoints are tested with Vitest integration tests (H3Event pattern) verifying HTTP 200 and correct JSON response
- ✅ Endpoints respond in < 100ms at baseline (no external calls, no database operations)
- ✅ `bun run verify` (lint + typecheck + test) passes without warnings
- ✅ CI passes: lint, typecheck, test, build

### Out of Scope

- Authentication or authorization
- Database access or persistence
- Complex business logic
- Middleware integration or logging
- Deployment or infrastructure changes
- E2E/Playwright smoke test integration (API testing only)

---

## Decomposition

### 1 Epic: Add Three Independent Health Check Endpoints

Single, additive feature with three independent implementations.

#### Story 1: Implement Three Endpoints & Tests (VRTX-0084)

Three parallel, independent tasks: implement each endpoint handler and its test suite without shared code.

**Tasks**:

- VRTX-0085 — Implement `/api/healthz-smoke-302960562-a` endpoint
- VRTX-0086 — Implement `/api/healthz-smoke-302960562-b` endpoint
- VRTX-0087 — Implement `/api/healthz-smoke-302960562-c` endpoint

**Parallelization**: All three tasks are independent (no shared files, no cross-dependencies). They can be assigned to the same or different engineers and run concurrently.

---

## Phases

### Phase 1: Planning ✓ (THIS TICKET — VRTX-0082)

- [x] Investigate codebase patterns (file-based routing, endpoint structure, test conventions)
- [x] Fetch idea spec and understand requirements for 3 independent endpoints
- [x] Identify decomposition strategy (1 EPIC → 1 STORY → 3 parallel TASKs)
- [x] Write sprint plan with parallelization strategy
- [x] Update root docs (PRODUCT.md, ARCHITECTURE.md, DESIGN.md, AGENT.md)
- [x] Create tickets with acceptance criteria
- [x] Run checklist and verify all blockers cleared

**Deliverables**: SPRINT-PLAN.md (this file), updated root docs, FSM tickets created, checklist passing

---

### Phase 2A: Implementation — Endpoint A (VRTX-0085)

**Task**: Implement `/api/healthz-smoke-302960562-a` endpoint

**Work**:

- Create `routes/api/healthz-smoke-302960562-a.ts` using the Nitro `defineHandler` pattern
- Handler returns `{ok:true, variant:"302960562"}` with HTTP 200
- Create corresponding test file: `routes/api/healthz-smoke-302960562-a.test.ts`
- Tests verify:
  - Response body matches expected object
  - HTTP status code is 200
  - Response is fast (< 100ms)

**Interface Contract**:

- **Endpoint**: `GET /api/healthz-smoke-302960562-a`
- **Request**: No body, no query params, no auth required
- **Response**: `{ok:true, variant:"302960562"}` (JSON)
- **Status**: 200 OK
- **Side Effects**: None

**Files**:

- `routes/api/healthz-smoke-302960562-a.ts` — endpoint handler
- `routes/api/healthz-smoke-302960562-a.test.ts` — integration test
- `artifacts/SPRINT-0019/VRTX-0085/PLAN.md` — detailed task plan

**Definition of Done**:

- Endpoint handler written and follows existing pattern (see `routes/api/healthz-smoke-cancel-407995880.ts`)
- Test file written with ≥2 test cases (response shape, performance)
- All tests pass: `bun run test` succeeds
- Lint passes: `bun run lint` succeeds
- TypeScript check passes: `bun run typecheck` succeeds
- Build succeeds: `bun run build` produces valid output
- No shared code with endpoints B and C

---

### Phase 2B: Implementation — Endpoint B (VRTX-0086)

**Task**: Implement `/api/healthz-smoke-302960562-b` endpoint

**Work** (identical to Phase 2A, only filename differs):

- Create `routes/api/healthz-smoke-302960562-b.ts` using the Nitro `defineHandler` pattern
- Handler returns `{ok:true, variant:"302960562"}` with HTTP 200
- Create corresponding test file: `routes/api/healthz-smoke-302960562-b.test.ts`
- Tests verify:
  - Response body matches expected object
  - HTTP status code is 200
  - Response is fast (< 100ms)

**Interface Contract**:

- **Endpoint**: `GET /api/healthz-smoke-302960562-b`
- **Request**: No body, no query params, no auth required
- **Response**: `{ok:true, variant:"302960562"}` (JSON)
- **Status**: 200 OK
- **Side Effects**: None

**Files**:

- `routes/api/healthz-smoke-302960562-b.ts` — endpoint handler
- `routes/api/healthz-smoke-302960562-b.test.ts` — integration test
- `artifacts/SPRINT-0019/VRTX-0086/PLAN.md` — detailed task plan

**Definition of Done**:

- Endpoint handler written and follows existing pattern (see `routes/api/healthz-smoke-cancel-407995880.ts`)
- Test file written with ≥2 test cases (response shape, performance)
- All tests pass: `bun run test` succeeds
- Lint passes: `bun run lint` succeeds
- TypeScript check passes: `bun run typecheck` succeeds
- Build succeeds: `bun run build` produces valid output
- No shared code with endpoints A and C

---

### Phase 2C: Implementation — Endpoint C (VRTX-0087)

**Task**: Implement `/api/healthz-smoke-302960562-c` endpoint

**Work** (identical to Phase 2A, only filename differs):

- Create `routes/api/healthz-smoke-302960562-c.ts` using the Nitro `defineHandler` pattern
- Handler returns `{ok:true, variant:"302960562"}` with HTTP 200
- Create corresponding test file: `routes/api/healthz-smoke-302960562-c.test.ts`
- Tests verify:
  - Response body matches expected object
  - HTTP status code is 200
  - Response is fast (< 100ms)

**Interface Contract**:

- **Endpoint**: `GET /api/healthz-smoke-302960562-c`
- **Request**: No body, no query params, no auth required
- **Response**: `{ok:true, variant:"302960562"}` (JSON)
- **Status**: 200 OK
- **Side Effects**: None

**Files**:

- `routes/api/healthz-smoke-302960562-c.ts` — endpoint handler
- `routes/api/healthz-smoke-302960562-c.test.ts` — integration test
- `artifacts/SPRINT-0019/VRTX-0087/PLAN.md` — detailed task plan

**Definition of Done**:

- Endpoint handler written and follows existing pattern (see `routes/api/healthz-smoke-cancel-407995880.ts`)
- Test file written with ≥2 test cases (response shape, performance)
- All tests pass: `bun run test` succeeds
- Lint passes: `bun run lint` succeeds
- TypeScript check passes: `bun run typecheck` succeeds
- Build succeeds: `bun run build` produces valid output
- No shared code with endpoints A and B

---

### Phase 3: Test Harness

**Scope**: Covered within Phases 2A, 2B, 2C (implementation includes testing)

- Unit/integration tests via Vitest (`routes/**/*.test.ts`)
- API integration tests (real H3Event, handler runs with no live server)
- Pattern: Copy from `routes/api/healthz-smoke-cancel-407995880.test.ts`

**Test Coverage (per endpoint)**:

- Response body shape and values (`{ok:true, variant:"302960562"}`)
- HTTP status code (200)
- Response time (< 100ms)
- No middleware dependencies (endpoint runs standalone)

**Expected Test Output**:

After all three endpoints are implemented:

```
✓ routes/api/healthz-smoke-302960562-a.test.ts (2 tests)
✓ routes/api/healthz-smoke-302960562-b.test.ts (2 tests)
✓ routes/api/healthz-smoke-302960562-c.test.ts (2 tests)
---
6 tests passed
```

---

### Phase 4: CI

**GitHub Actions** (`.github/workflows/` — already in place):

Triggered on push to `vortex/sprint/*` and `vortex/feat/*` branches:

1. **Lint**: `bun run lint` — ESLint 9 + typescript-eslint + Prettier
   - Must pass with zero warnings
   - All three new route files linted
2. **TypeScript**: `bun run typecheck` — full project type check
   - All three new route and test files type-checked
3. **Unit/Integration Tests**: `bun run test` — Vitest on all `.test.ts` and `.test.tsx` files
   - New test files: `routes/api/healthz-smoke-302960562-a.test.ts`, `...b.test.ts`, `...c.test.ts`
   - All 6 test cases (2 per endpoint) pass
4. **Build**: `bun run build`
   - Frontend: Vite SPA → `dist/`
   - Backend: Nitro server → `.output/server/index.mjs`
   - All three new endpoints bundled into server
5. **E2E Smoke** (optional, if Chromium available): `bun run test:smoke`
   - Smoke test does not target these endpoints (E2E integration is out of scope for this sprint)

**Expected CI Status**: All checks pass before merge.

**No changes required** to GitHub Actions, Dockerfile, or deployment config — endpoints are pure in-memory handlers.

---

## Key Decisions

| Decision                                          | Rationale                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| Three independent endpoint files (no shared code) | Minimize coupling; each endpoint is a leaf unit of work; enables parallelization |
| Vitest + H3Event for tests                        | Matches project convention; no live server needed for integration test           |
| Returns `{ok:true, variant:"302960562"}`          | Per spec; matches pattern of other `healthz-smoke-*` endpoints in codebase       |
| No dependencies on middleware, DB, or auth        | Pure, standalone handlers — fast and simple to test                              |
| 3 parallel TASKs with no dependencies             | Allows all three to be built concurrently by one or more engineers               |
| Lint + typecheck required before commit           | Zero-warning policy enforced by project CI                                       |

---

## Files to Create/Update

### New Files (8 total)

**Endpoint A**:

- `routes/api/healthz-smoke-302960562-a.ts` (endpoint handler)
- `routes/api/healthz-smoke-302960562-a.test.ts` (test suite)

**Endpoint B**:

- `routes/api/healthz-smoke-302960562-b.ts` (endpoint handler)
- `routes/api/healthz-smoke-302960562-b.test.ts` (test suite)

**Endpoint C**:

- `routes/api/healthz-smoke-302960562-c.ts` (endpoint handler)
- `routes/api/healthz-smoke-302960562-c.test.ts` (test suite)

**Sprint Docs**:

- `artifacts/SPRINT-0019/SPRINT-PLAN.md` (this file)
- `artifacts/SPRINT-0019/VRTX-0085/PLAN.md` (task plan for endpoint A)
- `artifacts/SPRINT-0019/VRTX-0086/PLAN.md` (task plan for endpoint B)
- `artifacts/SPRINT-0019/VRTX-0087/PLAN.md` (task plan for endpoint C)

### Updated Files (4 total)

- `PRODUCT.md` — Changelog entry for 2026-07-26, updated sprint count
- `ARCHITECTURE.md` — Changelog entry for 2026-07-26
- `DESIGN.md` — Changelog entry for 2026-07-26
- `AGENT.md` — Changelog entry for 2026-07-26 (if applicable)

### CI (No Changes Required)

- `.github/workflows/ci.yml` — already set up for `vortex/**` branches
- No Dockerfile/K8s changes (endpoints are purely in-memory)

---

## Testing Strategy

### Unit/Integration Tests (Vitest + H3Event)

**Pattern** (from `routes/api/healthz-smoke-cancel-407995880.test.ts`):

For `/api/healthz-smoke-302960562-a`:

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";
import healthz from "./healthz-smoke-302960562-a";

describe("GET /api/healthz-smoke-302960562-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-302960562-a"));
    const result = await healthz(event);
    expect(result).toEqual({ ok: true, variant: "302960562" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-302960562-a"));
    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

Endpoints B and C follow the same pattern, only URL and import path differ.

### No E2E/Smoke Test Changes Required

The Playwright smoke test (`e2e/smoke.spec.ts`) remains unchanged. It does not need to verify these endpoints — API testing is handled by Vitest integration tests. If needed in a future sprint, the smoke test could be extended to include these endpoints.

### Run Tests

```bash
bun run test
# Output:
# ✓ routes/api/healthz-smoke-302960562-a.test.ts (2)
# ✓ routes/api/healthz-smoke-302960562-b.test.ts (2)
# ✓ routes/api/healthz-smoke-302960562-c.test.ts (2)
# Test Files  ...
# Tests       6 passed
```

---

## Success Metrics

- ✅ All three endpoints are live at their respective URLs
- ✅ Each response is `{ok:true, variant:"302960562"}` with HTTP 200
- ✅ Tests pass locally: `bun run test` shows 6 new test cases (2 per endpoint) all passing
- ✅ CI passes: lint, typecheck, test, build all green
- ✅ No regressions: existing endpoints and tests still work
- ✅ Code follows project conventions (file-based routing, Vitest, H3Event pattern)
- ✅ No shared code between endpoints (each is self-contained)
- ✅ All endpoints respond in < 100ms

---

## Risks & Mitigations

| Risk                      | Mitigation                                                             |
| ------------------------- | ---------------------------------------------------------------------- |
| Lint/format issues        | Run `bun run lint --fix` before commit; pre-commit hook catches errors |
| TypeScript errors         | Run `bun run typecheck` locally first                                  |
| Test failures             | Verify tests run in isolation (`bun run test --reporter=verbose`)      |
| Accidentally sharing code | Review PRs to ensure each endpoint is completely standalone            |
| CI timeout                | No deployment/infra changes; should be instant                         |
| Merge conflicts (3 tasks) | Endpoints touch different files (no overlaps); conflicts unlikely      |

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0019

**Feature**: Add three independent health check endpoints. Simple GET endpoints `/api/healthz-smoke-302960562-a`, `//api/healthz-smoke-302960562-b`, and `/api/healthz-smoke-302960562-c`, each returning `{ok:true, variant:"302960562"}` with no dependencies, auth, or database access. Demonstrates parallel endpoint development pattern. Includes integration tests and CI validation.

**Added**:

- `routes/api/healthz-smoke-302960562-a.ts` — endpoint handler (A)
- `routes/api/healthz-smoke-302960562-a.test.ts` — test suite (2 cases)
- `routes/api/healthz-smoke-302960562-b.ts` — endpoint handler (B)
- `routes/api/healthz-smoke-302960562-b.test.ts` — test suite (2 cases)
- `routes/api/healthz-smoke-302960562-c.ts` — endpoint handler (C)
- `routes/api/healthz-smoke-302960562-c.test.ts` — test suite (2 cases)
- Sprint plan: `artifacts/SPRINT-0019/SPRINT-PLAN.md`
- Per-task plans: `artifacts/SPRINT-0019/VRTX-{0085,0086,0087}/PLAN.md`

**Updated**: Root docs (PRODUCT.md, ARCHITECTURE.md, DESIGN.md, AGENT.md) with dated Changelog entries.

---

## Ticket Summary

| Ticket    | Type  | Title                                               | Dependencies     | Owner    |
| --------- | ----- | --------------------------------------------------- | ---------------- | -------- |
| VRTX-0083 | EPIC  | Add Three Independent Health Check Endpoints        | VST-0025 (idea)  | —        |
| VRTX-0084 | STORY | Implement Three Endpoints & Tests                   | VRTX-0083 (epic) | —        |
| VRTX-0085 | TASK  | Implement `/api/healthz-smoke-302960562-a` endpoint | VRTX-0082 (plan) | engineer |
| VRTX-0086 | TASK  | Implement `/api/healthz-smoke-302960562-b` endpoint | VRTX-0082 (plan) | engineer |
| VRTX-0087 | TASK  | Implement `/api/healthz-smoke-302960562-c` endpoint | VRTX-0082 (plan) | engineer |

**Total Scope**: 1 EPIC, 1 STORY, 3 parallel TASKs (minimum viable backlog for feature).

**Parallelization**: VRTX-0085, VRTX-0086, VRTX-0087 have NO inter-task dependencies and can be assigned to the same or different engineers, running concurrently.

---

## Next Steps (Post-Sprint)

1. Create FSM tickets (VRTX-0083, VRTX-0084, VRTX-0085, VRTX-0086, VRTX-0087)
2. Engineer(s) implement tasks in parallel:
   - VRTX-0085: writes `/api/healthz-smoke-302960562-a` + tests
   - VRTX-0086: writes `/api/healthz-smoke-302960562-b` + tests
   - VRTX-0087: writes `/api/healthz-smoke-302960562-c` + tests
3. CI validates all three (lint, typecheck, test, build)
4. Tickets transition to in_review, then done
5. Sprint branch merges into main
6. All three endpoints are live in next deployment

---

**Plan written**: 2026-07-26  
**Sprint Goal**: Add three independent health check endpoints returning `{ok:true, variant:"302960562"}`  
**Expected Duration**: 1-2 hours total (parallel work on 3 identical tasks)  
**Complexity**: Low (three independent files, no dependencies, proven pattern in codebase)
