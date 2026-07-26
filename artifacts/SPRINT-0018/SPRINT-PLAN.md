# SPRINT-0018 Bugfix Plan — /healthz-smoke-cancel-bugfix-962738443 Returns 404

**Sprint Goal**: Fix health check endpoint returning 404 instead of 200 with correct JSON response.

**Idea**: VRTX-0075 — [smoke-cancel-178505977028855] /healthz-smoke-cancel-bugfix-962738443 returns 404

---

## Executive Summary

Users attempting to call GET `/api/healthz-smoke-cancel-bugfix-962738443` receive an HTTP 404 (Not Found) error. The endpoint is entirely missing from the codebase. Expected behavior: the endpoint should return HTTP 200 with a JSON object `{ok:true, variant:"962738443"}`.

**Impact**: Smoke test failures, endpoint not available for health checks.

**Fix Strategy**: Create the missing route handler and test file following the established pattern in the codebase.

---

## Root Cause Analysis (RCA)

### Defect

**Symptom**: GET `/api/healthz-smoke-cancel-bugfix-962738443` returns HTTP 404

**Repro Steps**:

```bash
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-962738443
```

**Expected Result**: HTTP 200 with JSON:

```json
{
  "ok": true,
  "variant": "962738443"
}
```

**Actual Result**: HTTP 404 (Not Found)

### Root Cause

**Primary Cause**: Missing route handler file

The endpoint file `routes/api/healthz-smoke-cancel-bugfix-962738443.ts` does not exist. Nitro's file-based routing system requires the handler file to exist; without it, the route cannot be resolved, resulting in a 404.

**Contributing Factors**:

- No corresponding test file (`routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`) exists
- The endpoint was never created in the first place

### Why This Happened

The endpoint specification exists in the backlog but was never implemented. This appears to be a gap in the implementation phase of a previous sprint.

### Impact Assessment

- **Severity**: Medium
- **Affected Endpoints**: 1 (just this one endpoint)
- **User Impact**: Smoke tests attempting to call this endpoint fail with 404
- **Data Loss**: None (read-only endpoint, no side effects)
- **Other Endpoints**: No impact on other endpoints or functionality

---

## Fix Plan

### Overview

Create the missing endpoint handler and test file using the proven pattern from existing healthz-smoke-bugfix endpoints (e.g., `healthz-smoke-bugfix-1054626998.ts` and its test).

### Files to Create

1. **`routes/api/healthz-smoke-cancel-bugfix-962738443.ts`**
   - Simple handler using `defineHandler()` from `nitro/h3`
   - Returns `{ok:true, variant:"962738443"}`
   - ~8 lines of code

2. **`routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`**
   - Integration test using H3Event
   - Test 1: Verify response body is correct
   - Test 2: Verify response time is < 100ms
   - ~32 lines of code

### Implementation Steps

#### Step 1: Create Handler File

**File**: `routes/api/healthz-smoke-cancel-bugfix-962738443.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "962738443",
  };
});
```

#### Step 2: Create Test File

**File**: `routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import handler from "./healthz-smoke-cancel-bugfix-962738443";

/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/healthz-smoke-cancel-bugfix-962738443 was returning 404
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
describe("GET /api/healthz-smoke-cancel-bugfix-962738443", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-962738443"));

    const result = await handler(event);

    expect(result).toEqual({ ok: true, variant: "962738443" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-962738443"));

    const startTime = performance.now();
    await handler(event);
    const endTime = performance.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(100);
  });
});
```

#### Step 3: Verify Locally

```bash
# Run tests for this endpoint
bun run test -- healthz-smoke-cancel-bugfix-962738443

# Run all tests
bun run test

# Full verification gate
bun run verify
```

#### Step 4: Commit & Push

```bash
git add routes/api/healthz-smoke-cancel-bugfix-962738443.ts routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts
git commit -m "fix: add missing /healthz-smoke-cancel-bugfix-962738443 endpoint

Missing route handler was causing 404 responses. Implement the endpoint
following the established healthz-smoke-bugfix pattern.

Fixes: VRTX-0075
Refs: SPRINT-0018"
git push -u origin vortex/feat/VRTX-0075-fix-healthz-962738443
```

---

## Verification & Testing

### Manual Testing

After fix is deployed, verify the endpoint returns the correct response:

```bash
# Test endpoint directly
curl -s http://localhost:5000/api/healthz-smoke-cancel-bugfix-962738443 | jq .

# Expected output:
# {
#   "ok": true,
#   "variant": "962738443"
# }

# Verify HTTP status code is 200
curl -i http://localhost:5000/api/healthz-smoke-cancel-bugfix-962738443
```

### Automated Testing

Tests will verify:

1. Response body matches `{ok:true, variant:"962738443"}`
2. HTTP status code is 200 (implicit in successful response)
3. Response time is under 100ms

All tests pass as part of the CI gate: `bun run verify` (lint + typecheck + test).

### Regression Assurance

The test file serves as a regression test. If this endpoint is accidentally removed in the future, the test will fail and alert developers.

---

## Success Criteria

- ✅ Endpoint file created at `routes/api/healthz-smoke-cancel-bugfix-962738443.ts`
- ✅ Test file created at `routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`
- ✅ Tests pass locally: `bun run test` shows passing tests for this endpoint
- ✅ All tests pass: no regressions in existing tests
- ✅ Lint passes: `bun run lint` with zero warnings
- ✅ TypeScript passes: `bun run typecheck` succeeds
- ✅ Build succeeds: `bun run build` produces `dist/` and `.output/`
- ✅ Endpoint returns HTTP 200 with correct JSON response
- ✅ Response time is < 100ms
- ✅ CI passes: all GitHub Actions checks pass

---

## Files to Create

| File                                                       | Type    | Lines      | Purpose                 |
| ---------------------------------------------------------- | ------- | ---------- | ----------------------- |
| `routes/api/healthz-smoke-cancel-bugfix-962738443.ts`      | Handler | ~8         | Endpoint implementation |
| `routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts` | Test    | ~32        | Regression test         |
| `artifacts/SPRINT-0018/VRTX-0075/PLAN.md`                  | Plan    | Per ticket | Detailed fix plan       |

---

## Files NOT to Modify

- AGENT.md, PRODUCT.md, ARCHITECTURE.md, DESIGN.md — No changes (endpoint behavior is additive, not a change to existing observable behavior)
- No other source files should be modified

---

## Risks & Mitigations

| Risk               | Mitigation                                                                  |
| ------------------ | --------------------------------------------------------------------------- |
| Lint/format issues | Run `bun run lint --fix` before commit                                      |
| TypeScript errors  | Run `bun run typecheck` locally first                                       |
| Test failures      | Verify test runs in isolation with verbose output                           |
| CI timeout         | No deployment/infra changes; should be instant                              |
| Variant mismatch   | Double-check variant string is exactly `"962738443"` (copy-paste carefully) |

---

## Ticket Summary

| Ticket    | Type   | Title                                              | Status  | Dependencies |
| --------- | ------ | -------------------------------------------------- | ------- | ------------ |
| VRTX-0075 | DEFECT | /healthz-smoke-cancel-bugfix-962738443 returns 404 | BACKLOG | None         |

**Total Scope**: 1 DEFECT (straightforward missing endpoint fix).

---

## Implementation Complexity

- **Estimated Time**: < 15 minutes (straightforward missing file)
- **Complexity**: Very Low (single file, proven pattern)
- **Risk**: Very Low (additive only, no existing code touched)
- **Pattern Validation**: Identical to healthz-smoke-bugfix-\* endpoints already in codebase

---

## Rollback Plan

If this fix causes issues (unlikely, as it's purely additive):

1. Remove both files: `routes/api/healthz-smoke-cancel-bugfix-962738443.ts` and `.test.ts`
2. Revert the commit: `git revert <commit-hash>`
3. Endpoint reverts to 404 (pre-fix state)

---

## Changelog

This bugfix changes observable behavior (404 → 200), but does not warrant updates to root documentation since:

- No architectural changes
- No stack changes
- No deployment/infrastructure changes
- Simple additive endpoint following existing pattern
- Similar to SPRINT-0004, SPRINT-0005, SPRINT-0007, SPRINT-0017 (all added health check endpoints without doc updates in AGENT/PRODUCT/ARCHITECTURE/DESIGN)

---

## Followup Items

None identified. Once the endpoint is implemented and tests pass, the defect is fully resolved.

---

**Plan Written**: 2026-07-26  
**Defect**: /healthz-smoke-cancel-bugfix-962738443 returns 404  
**Fix Complexity**: Very Low (straightforward missing endpoint)  
**Estimated Fix Time**: < 15 minutes
