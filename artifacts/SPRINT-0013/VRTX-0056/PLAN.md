# VRTX-0056: Implement Health Check Endpoint

**Sprint:** SPRINT-0013  
**Ticket Type:** TASK  
**Owner:** Engineer  
**Status:** Ready for Implementation

---

## Summary

Implement the `/healthz-smoke-cancel-537464696` GET endpoint following the established pattern from SPRINT-0004, SPRINT-0005, and SPRINT-0007. The endpoint returns a minimal JSON response with no dependencies on auth, database, or middleware.

**Plan Path:** `artifacts/SPRINT-0013/SPRINT-PLAN.md#phase-1-implementation`

---

## Context & Background

### Problem

No `/healthz-smoke-cancel-537464696` endpoint yet. Existing pattern (SPRINT-0004/0005/0007) demonstrates simple, self-contained GET route pattern.

### Why This Matters

- Expands smoke test coverage with another health check variant
- Demonstrates minimal API endpoint pattern (no side effects, no dependencies)
- Serves as reference for future simple endpoint implementations

### Scope

- Single file: `routes/api/healthz-smoke-cancel-537464696.ts`
- Single test file: `routes/api/healthz-smoke-cancel-537464696.test.ts`
- No changes to middleware, database, or existing routes
- No auth required

### File/Module Ownership Map

| File                                                | Module  | Owner    | Purpose                                   |
| --------------------------------------------------- | ------- | -------- | ----------------------------------------- |
| `routes/api/healthz-smoke-cancel-537464696.ts`      | Handler | Engineer | GET endpoint handler, returns response    |
| `routes/api/healthz-smoke-cancel-537464696.test.ts` | Test    | Engineer | Integration test, structure + performance |

---

## Acceptance Criteria (Definition of Done)

- [ ] **File created:** `routes/api/healthz-smoke-cancel-537464696.ts` exists with correct handler
  - Imports `defineHandler` from `nitro/h3`
  - Returns object: `{ ok: true, variant: "537464696" }`
  - No middleware dependencies, no auth checks
- [ ] **Test created:** `routes/api/healthz-smoke-cancel-537464696.test.ts` exists with 2 test cases
  - Test 1: Verifies response structure equals `{ ok: true, variant: "537464696" }`
  - Test 2: Verifies response time is <100ms
  - Both tests use real `H3Event` (not mocked)
- [ ] **Linting passes:** `bun run lint` exits with no warnings or errors
- [ ] **Type checking passes:** `bun run typecheck` exits with no errors
- [ ] **Tests pass:** `bun run test` passes all tests, including the new test file
- [ ] **Build succeeds:** `bun run build` completes without errors
- [ ] **Committed:** All changes committed on ticket branch `vortex/feat/VRTX-0056-***` with clear message

---

## Implementation Details

### Pattern Reference

Copy the exact pattern from `routes/api/healthz-smoke-cancel-407995880.ts`:

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "407995880",  // ← change to "537464696"
  };
});
```

### Test Pattern Reference

Copy the test pattern from `routes/api/healthz-smoke-cancel-407995880.test.ts`:

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-407995880";  // ← import the new handler

describe("GET /api/healthz-smoke-cancel-537464696", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-537464696"));
    const result = await healthz(event);
    expect(result).toEqual({ ok: true, variant: "537464696" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-537464696"));
    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

### File Routing

- **File path:** `routes/api/healthz-smoke-cancel-537464696.ts`
- **HTTP method:** GET (default, no `.get` suffix needed)
- **Endpoint:** `GET /api/healthz-smoke-cancel-537464696`
- **Response code:** HTTP 200 (implicit from returning an object)

### Why This Pattern Works

- **File-based routing:** Nitro scans `routes/api/` and creates routes automatically
- **No middleware needed:** Health check is pure, stateless
- **Real H3Event in test:** Catches issues that mocks would hide
- **Timing assertion:** Ensures endpoint doesn't drift slow over time

---

## Dependencies

None. This endpoint is fully self-contained and doesn't depend on:

- Database access
- Middleware or auth middleware
- Other routes or utilities
- Environment variables

---

## Verification Steps (Local)

After implementation:

```bash
# 1. Run the test suite to verify the new test passes
bun run test

# 2. Check lint and type errors
bun run lint
bun run typecheck

# 3. Full verification gate (lint + typecheck + test)
bun run verify

# 4. Try building (dev server doesn't need rebuild, but verify build works)
bun run build

# 5. Optional: test the endpoint manually in the dev server
bun run dev
# Then: curl http://localhost:5000/api/healthz-smoke-cancel-537464696
```

---

## Git Workflow

1. **Branch:** Work on `vortex/feat/VRTX-0056-***` (created from sprint branch)
2. **Commit:**

   ```bash
   git add routes/api/healthz-smoke-cancel-537464696.ts routes/api/healthz-smoke-cancel-537464696.test.ts
   git commit -m "feat: add /healthz-smoke-cancel-537464696 endpoint

   Simple self-contained GET endpoint returning {ok:true,variant:\"537464696\"}.
   Demonstrates minimal health check pattern with integration test.

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Push:** `git push -u origin vortex/feat/VRTX-0056-***`
4. **Mark Done:** Call `a2a_transition_ticket(ticket_key="VRTX-0056", to="done")`

---

## Risks & Mitigations

| Risk                               | Likelihood | Impact                         | Mitigation                                        |
| ---------------------------------- | ---------- | ------------------------------ | ------------------------------------------------- |
| Copy-paste error in variant string | Low        | High (endpoint has wrong ID)   | Double-check variant is "537464696" in both files |
| Test uses wrong import path        | Low        | High (test fails)              | Copy exact test structure from template           |
| Missing test file                  | Medium     | High (no test coverage)        | Verify test file exists before commit             |
| Lint/typecheck failures            | Low        | Medium (must fix before merge) | Run `bun run verify` before pushing               |

---

## Next Steps

1. Create the two files following the pattern reference
2. Run `bun run verify` locally to ensure all gates pass
3. Commit and push
4. Transition ticket to done
5. Product will update docs (VRTX-0057)
6. QA will verify CI (VRTX-0058)
