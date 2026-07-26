# SPRINT-0016 Bugfix Plan — /healthz-smoke-cancel-bugfix-307790833 Returns 404

**Sprint Goal**: Root-cause and fix the 404 error on GET `/api/healthz-smoke-cancel-bugfix-307790833` endpoint.

**Committed Defect**: VRTX-0068 — [smoke-cancel-178505920023590] /healthz-smoke-cancel-bugfix-307790833 returns 404, should return ok+variant

---

## Root Cause Analysis

### Defect Summary

**Symptom**: GET `/api/healthz-smoke-cancel-bugfix-307790833` returns HTTP 404 Not Found

**Expected Behavior**: Should return HTTP 200 with response body `{ok:true, variant:"307790833"}`

**Reproduction**:

```bash
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-307790833
# Response: 404 Not Found
```

### Root Cause

The endpoint handler file **does not exist** in the codebase.

**Evidence**:

- Searched `/workspace/repo/routes/api/` for any file matching the pattern `*307790833*` — no results
- Compared with similar working endpoints:
  - `routes/api/healthz-smoke-bugfix-1054626998.ts` exists and returns 200 with correct response
  - `routes/api/healthz-smoke-bugfix2-559758399.ts` exists and returns 200 with correct response
  - `routes/api/healthz-smoke-bugfix3-428029175.ts` exists and returns 200 with correct response
- Pattern: Each working endpoint is a simple self-contained handler with no dependencies

**Why it 404s**: Nitro's file-based routing (`routes/api/**/*.ts`) only creates routes for files that exist. Since `healthz-smoke-cancel-bugfix-307790833.ts` is missing, the route is not registered, causing a 404 response from the catch-all.

---

## Fix Plan

### Overview

Create the missing endpoint handler and test file following the established pattern from existing bugfix endpoints. The fix is straightforward: add the missing file.

### Files to Create

1. **`routes/api/healthz-smoke-cancel-bugfix-307790833.ts`** — endpoint handler
   - Pattern: Copy from `routes/api/healthz-smoke-bugfix-1054626998.ts`
   - Change variant string from "1054626998" to "307790833"
   - Endpoint returns `{ok:true, variant:"307790833"}` with HTTP 200
   - No dependencies, no auth, no database

2. **`routes/api/healthz-smoke-cancel-bugfix-307790833.test.ts`** — test suite
   - Pattern: Copy from `routes/api/healthz-smoke-bugfix-1054626998.test.ts`
   - Update import path and handler references to match new filename
   - Update test descriptions to reference the correct variant
   - Tests:
     - Response shape verification: `{ok:true, variant:"307790833"}`
     - Performance assertion: response time < 100ms
     - Add regression test comment per existing pattern

### Interface Contract

**Endpoint**: `GET /api/healthz-smoke-cancel-bugfix-307790833`

**Request**:

- Method: GET
- Path: `/api/healthz-smoke-cancel-bugfix-307790833`
- No body, no query params, no auth required

**Response**:

- Status: HTTP 200 OK
- Body: JSON `{ok:true, variant:"307790833"}`
- Content-Type: application/json (automatic via Nitro)

**Side Effects**: None

### Definition of Done

- [ ] Endpoint handler file created: `routes/api/healthz-smoke-cancel-bugfix-307790833.ts`
- [ ] Handler returns `{ok:true, variant:"307790833"}` for all GET requests
- [ ] No middleware or database dependencies
- [ ] No auth checks
- [ ] Test file created: `routes/api/healthz-smoke-cancel-bugfix-307790833.test.ts`
- [ ] ≥2 test cases: response shape verification + performance (<100ms)
- [ ] All tests pass: `bun run test` succeeds for new test file
- [ ] Lint passes: `bun run lint` succeeds with zero warnings
- [ ] TypeScript check passes: `bun run typecheck` succeeds
- [ ] Build succeeds: `bun run build` produces valid dist/ and .output/
- [ ] Endpoint now returns 200: Manual verification via curl
- [ ] No regressions: Existing tests and endpoints still work

---

## Testing Strategy

### Unit/Integration Tests (Vitest + H3Event)

Pattern (from `routes/api/healthz-smoke-bugfix-1054626998.test.ts`):

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import handler from "./healthz-smoke-cancel-bugfix-307790833";

/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/healthz-smoke-cancel-bugfix-307790833 was returning 404
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
describe("GET /api/healthz-smoke-cancel-bugfix-307790833", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-307790833"));

    const result = await handler(event);

    expect(result).toEqual({ ok: true, variant: "307790833" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-307790833"));

    const startTime = performance.now();
    await handler(event);
    const endTime = performance.now();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(100);
  });
});
```

### Manual Regression Verification

After implementation:

```bash
# Endpoint should now return 200, not 404
curl -i http://localhost:5000/api/healthz-smoke-cancel-bugfix-307790833
# Expected: HTTP 200
# Expected body: {"ok":true,"variant":"307790833"}
```

---

## Key Decisions

| Decision                         | Rationale                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Copy existing pattern            | Proven pattern already used for bugfix-1054626998, bugfix2-559758399, etc.   |
| Self-contained handler           | No middleware, DB, or auth — minimal dependencies, fast, easy to test        |
| Vitest + H3Event pattern         | Matches project convention; no live server needed for integration test       |
| Includes regression test comment | Explicitly documents bug + root cause + fix for future maintainers           |
| No root doc updates needed       | This is a bugfix only (adds missing endpoint), doesn't change observable API |

---

## Files to Create/Update

### New Files

- `routes/api/healthz-smoke-cancel-bugfix-307790833.ts` (endpoint handler)
- `routes/api/healthz-smoke-cancel-bugfix-307790833.test.ts` (test suite)
- `artifacts/SPRINT-0016/VRTX-0068/PLAN.md` (bugfix plan)

### No Root Doc Updates Required

Observable behavior changes (endpoint now works), but this is a bugfix for an existing defect, not a new feature. No changes to AGENT.md, PRODUCT.md, ARCHITECTURE.md, or DESIGN.md are needed.

### CI (No Changes Required)

- `.github/workflows/ci.yml` — already configured for `vortex/**` branches
- Tests will automatically run on the new test file

---

## Success Metrics

- ✅ GET `/api/healthz-smoke-cancel-bugfix-307790833` now returns HTTP 200 (not 404)
- ✅ Response body is exactly `{ok:true, variant:"307790833"}`
- ✅ Tests pass locally: `bun run test -- routes/api/healthz-smoke-cancel-bugfix-307790833.test.ts`
- ✅ CI passes: lint, typecheck, test, build all green
- ✅ No regressions: Existing bugfix endpoints still work
- ✅ Code follows project conventions (file-based routing, Vitest, H3Event pattern)

---

## Risks & Mitigations

| Risk                   | Mitigation                                                              |
| ---------------------- | ----------------------------------------------------------------------- |
| Typo in variant string | Ensure "307790833" is copied exactly (8 chars) in both handler and test |
| Missing test file      | Copy test file template from existing bugfix endpoint                   |
| Lint/format issues     | Run `bun run lint --fix` before commit; pre-commit hook catches errors  |
| Build failure          | Verify `bun run verify` passes locally before pushing                   |

---

## Ticket Map

| Ticket    | Type   | Title                                              | Fix Scope                                          | Owner    |
| --------- | ------ | -------------------------------------------------- | -------------------------------------------------- | -------- |
| VRTX-0068 | DEFECT | /healthz-smoke-cancel-bugfix-307790833 returns 404 | Create endpoint handler + test file, verify 200 OK | engineer |

**Total Scope**: 1 DEFECT ticket (add missing endpoint files).

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0016: Bugfix

**Issue**: GET `/api/healthz-smoke-cancel-bugfix-307790833` returned 404

**Root Cause**: Missing route handler file in `routes/api/`

**Fix**: Created `routes/api/healthz-smoke-cancel-bugfix-307790833.ts` and test file. Endpoint now returns 200 with `{ok:true, variant:"307790833"}` as expected.

**Affected Files**:

- `routes/api/healthz-smoke-cancel-bugfix-307790833.ts` (new)
- `routes/api/healthz-smoke-cancel-bugfix-307790833.test.ts` (new)

---

**Plan written**: 2026-07-26  
**Sprint Goal**: Fix /healthz-smoke-cancel-bugfix-307790833 404 error  
**Expected Duration**: < 30 min (straightforward file creation + test)  
**Complexity**: Low (copy existing pattern, update variant string)
