# VRTX-0087 Task Plan — Implement `/api/healthz-smoke-302960562-c` Endpoint

**Sprint**: SPRINT-0019  
**Ticket**: VRTX-0087  
**Type**: TASK  
**Title**: Implement `/api/healthz-smoke-302960562-c` endpoint  
**Parent**: VRTX-0084 (STORY)  
**Dependencies**: VRTX-0082 (planning complete)

---

## Overview

Implement a self-contained GET endpoint at `/api/healthz-smoke-302960562-c` that returns a JSON health check response with no dependencies, middleware, or database access.

## Scope

- Create endpoint handler file: `routes/api/healthz-smoke-302960562-c.ts`
- Create integration test file: `routes/api/healthz-smoke-302960562-c.test.ts`
- Ensure no shared code with endpoints A and B

## Context

This endpoint is one of three parallel, independent tasks in SPRINT-0019. Each endpoint is completely self-contained to enable parallel development. The pattern is proven in the codebase (see `routes/api/healthz-smoke-cancel-407995880.ts`).

### Key Decisions

- **Standalone file**: No shared utilities or helper functions
- **Simple response**: `{ok:true, variant:"302960562"}`
- **No middleware**: Endpoint is a direct handler, no auth/logging/rate-limiting
- **Fast**: No external calls, no database, responds in < 100ms

### Files Affected

| File Path                                      | Type   | Change | Ownership                     |
| ---------------------------------------------- | ------ | ------ | ----------------------------- |
| `routes/api/healthz-smoke-302960562-c.ts`      | Source | Create | This task (C only)            |
| `routes/api/healthz-smoke-302960562-c.test.ts` | Test   | Create | This task (C only)            |
| `artifacts/SPRINT-0019/VRTX-0087/PLAN.md`      | Doc    | Create | This task (planning artifact) |

**No overlaps**: Endpoints A and B remain completely independent.

---

## Implementation Details

### Endpoint Handler

**File**: `routes/api/healthz-smoke-302960562-c.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "302960562",
  };
});
```

**Spec**:

- **URL**: `GET /api/healthz-smoke-302960562-c`
- **Request**: No body, no query params, no headers
- **Response**: JSON `{ok:true, variant:"302960562"}`
- **Status**: 200 OK (implicit in Nitro)
- **Side Effects**: None
- **Performance**: < 100ms (no I/O, pure function)

### Integration Tests

**File**: `routes/api/healthz-smoke-302960562-c.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-302960562-c";

describe("GET /api/healthz-smoke-302960562-c", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-302960562-c"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "302960562" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-302960562-c"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Test Cases**:

1. **Response Shape & Values**: Verify response body is exactly `{ok:true, variant:"302960562"}`
2. **Performance**: Verify response time is < 100ms

---

## Acceptance Criteria (Definition of Done)

- [ ] **Handler Implementation**
  - [ ] File `routes/api/healthz-smoke-302960562-c.ts` created
  - [ ] Handler uses `defineHandler` from `nitro/h3`
  - [ ] Handler returns `{ok:true, variant:"302960562"}`
  - [ ] No imports beyond `nitro/h3`
  - [ ] No middleware dependencies

- [ ] **Test Implementation**
  - [ ] File `routes/api/healthz-smoke-302960562-c.test.ts` created
  - [ ] ≥2 test cases (response shape, performance)
  - [ ] Tests use H3Event pattern (no live server)
  - [ ] All tests pass: `bun run test -- routes/api/healthz-smoke-302960562-c.test.ts`

- [ ] **Quality Gates**
  - [ ] Lint passes: `bun run lint` (zero warnings)
  - [ ] TypeScript passes: `bun run typecheck` (no errors)
  - [ ] All tests pass: `bun run test` (6 total across A/B/C)
  - [ ] Build succeeds: `bun run build` (Vite + Nitro)

- [ ] **Code Review**
  - [ ] Code follows existing patterns (see `routes/api/healthz-smoke-cancel-407995880.ts` and `routes/api/healthz-smoke-cancel-407995880.test.ts`)
  - [ ] No shared code with endpoints A or B
  - [ ] Endpoint is completely standalone
  - [ ] Comments or docstrings not required (code is self-documenting)

---

## Technical Approach

### Steps

1. **Create endpoint handler** (`routes/api/healthz-smoke-302960562-c.ts`)
   - Copy pattern from `routes/api/healthz-smoke-cancel-407995880.ts`
   - Update variant ID to `"302960562"`
   - Keep code minimal (no logic, no errors)

2. **Create test file** (`routes/api/healthz-smoke-302960562-c.test.ts`)
   - Copy pattern from `routes/api/healthz-smoke-cancel-407995880.test.ts`
   - Update URL and imported handler
   - Update test suite name and assertions

3. **Run verification locally**

   ```bash
   # Install (if needed)
   bun install

   # Run tests for this endpoint only
   bun run test -- routes/api/healthz-smoke-302960562-c.test.ts

   # Full verification
   bun run verify
   ```

4. **Stage and commit changes**

   ```bash
   git add routes/api/healthz-smoke-302960562-c.ts routes/api/healthz-smoke-302960562-c.test.ts
   git commit -m "feat(sprint-0019): [healthz] /api/healthz-smoke-302960562-c endpoint

   Add self-contained GET endpoint returning {ok:true, variant:\"302960562\"}.
   Includes integration tests and full verification passing.

   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
   ```

### No Breaking Changes

- Endpoint is a new route, no modifications to existing routes
- No changes to middleware, database, or other endpoints
- Build output increases minimally (< 100 bytes in bundled server)

### Testing Approach

- **Integration test** (H3Event pattern): Tests handler directly without HTTP server
- **No E2E required**: Smoke test coverage is at the HTTP level (outside this task scope)
- **Run all tests**: `bun run test` must pass with all 6 cases (A, B, C each have 2 cases)

---

## Verification Checklist

Before marking this task done:

- [ ] Both files created and committed to feature branch
- [ ] Tests pass locally: `bun run test`
- [ ] Lint passes locally: `bun run lint`
- [ ] TypeScript passes: `bun run typecheck`
- [ ] Build succeeds: `bun run build`
- [ ] Full verification passes: `bun run verify`
- [ ] Code review checklist satisfied (pattern followed, no shared code)
- [ ] Branch is pushed to remote
- [ ] Ticket status transitioned to `in_review`

---

## Risks & Mitigations

| Risk                                    | Mitigation                                                          |
| --------------------------------------- | ------------------------------------------------------------------- |
| Typo in handler code                    | Run tests locally before committing; tests will catch any issues    |
| Lint failure on new files               | Pre-commit hook and CI will catch; run `bun run lint --fix` locally |
| TypeScript error in test file           | Run `bun run typecheck` locally; tests won't compile if wrong       |
| Accidentally importing from other files | Grep for imports in your file; should only have `nitro/h3`          |
| Merge conflict with A or B              | No: each endpoint is a separate file with no overlaps               |

---

## Reference Examples

### Pattern: Minimal Endpoint Handler

Reference file: `routes/api/healthz-smoke-cancel-407995880.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "407995880",
  };
});
```

→ **For this task, change `variant` to `"302960562"` only.**

### Pattern: H3Event Integration Test

Reference file: `routes/api/healthz-smoke-cancel-407995880.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-407995880";

describe("GET /api/healthz-smoke-cancel-407995880", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-407995880"));
    const result = await healthz(event);
    expect(result).toEqual({ ok: true, variant: "407995880" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-407995880"));
    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

→ **For this task, change:**

- Import path to `"./healthz-smoke-302960562-c"`
- Describe block title to `"GET /api/healthz-smoke-302960562-c"`
- Request URL to `"http://localhost/api/healthz-smoke-302960562-c"`
- Expected variant to `"302960562"`

---

## Deliverables

1. **Code**:
   - `routes/api/healthz-smoke-302960562-c.ts` (handler)
   - `routes/api/healthz-smoke-302960562-c.test.ts` (tests)

2. **Documentation**:
   - This plan file: `artifacts/SPRINT-0019/VRTX-0087/PLAN.md`

3. **Verification**:
   - `bun run verify` passes
   - All tests pass (6 total when all 3 endpoints done)

4. **Git**:
   - Feature branch: `vortex/feat/VRTX-0087-...` (or shared branch with A and B)
   - Commit message following project convention
   - Pushed to remote before marking done

---

**Task Estimated Effort**: 15–30 minutes (write + test + verify)

**Task Complexity**: Low (proven pattern in codebase, no business logic, minimal scope)

---

## Sign-Off

Engineer checklist:

- [ ] I have implemented the handler exactly per spec
- [ ] I have implemented the tests exactly per spec
- [ ] I have run `bun run verify` locally and it passed
- [ ] I have committed to the feature branch and pushed
- [ ] I have reviewed my code against the reference examples
- [ ] I am ready for code review

---

**Plan written**: 2026-07-26  
**Task Type**: TASK (implementation)  
**Dependencies**: None (parallel with VRTX-0085, VRTX-0086)  
**Blocker**: VRTX-0082 (planning must be complete)
