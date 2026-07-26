# VRTX-0032 Defect Plan — /healthz-smoke-cancel-bugfix-423890514 Returns 404

**Defect**: VRTX-0032 — `/healthz-smoke-cancel-bugfix-423890514` returns 404, should return ok+variant  
**Sprint**: SPRINT-0006  
**Parent Plan**: `artifacts/SPRINT-0006/SPRINT-PLAN.md`

---

## Defect Description

### Issue

GET `/api/healthz-smoke-cancel-bugfix-423890514` returns HTTP 404 (Not Found).

### Expected Behavior

GET `/api/healthz-smoke-cancel-bugfix-423890514` should return HTTP 200 with JSON body:

```json
{
  "ok": true,
  "variant": "423890514"
}
```

### Reproduction Steps

```bash
curl -i http://localhost:5000/api/healthz-smoke-cancel-bugfix-423890514
# Expected: HTTP 200, {"ok":true,"variant":"423890514"}
# Actual: HTTP 404, "Not Found"
```

### Impact

- Service consumers cannot check this specific health endpoint
- Smoke test suite or monitoring might fail if it expects this endpoint
- Indicates missing endpoint implementation

---

## Root Cause Analysis

### Investigation Summary

**File Presence Check**:

- Searched `/workspace/repo/routes/api/` for files matching `healthz-smoke-cancel-bugfix-423890514*`
- **Result**: No such files found
- **Conclusion**: The endpoint handler file is completely missing

**Pattern Verification**:

- Reviewed existing health check endpoints:
  - `routes/api/healthz-smoke-cancel-407995880.ts` (SPRINT-0004) ✓ exists
  - `routes/api/healthz-smoke-cancel-158110053.ts` (SPRINT-0005) ✓ exists
  - Other bugfix variants (1054626998, 559758399, 428029175) ✓ exist
  - Our target (423890514) ✗ missing

**Routing System Check**:

- Nitro file-based routing is correctly configured
- `vite.config.ts` has `serverDir: "./"` (required for `routes/` scanning)
- No exclusion rules prevent this file from being discovered
- **Conclusion**: System would load this file if it existed

### Root Cause

**Primary**: Missing implementation file `routes/api/healthz-smoke-cancel-bugfix-423890514.ts`

**Why**:

- Endpoint was specified but never created
- Regression: endpoint may have been deleted accidentally
- Or implementation was skipped/deferred from original sprint

**Contributing Factors**:

- No explicit endpoint registry (file-based routing is implicit)
- No end-to-end test prevents detection
- Defect escaped to this sprint without fix

---

## Fix Plan

### Fix Strategy

**Type**: Add missing endpoint (regression fix)

**Scope**:

- Add endpoint handler file
- Add integration test file
- Verify no conflicts with existing routes

**Implementation Pattern**: Follow SPRINT-0004 and SPRINT-0005 pattern (proven, tested, working)

### Implementation

#### File 1: Endpoint Handler

**Path**: `routes/api/healthz-smoke-cancel-bugfix-423890514.ts`

**Content**:

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "423890514",
  };
});
```

**Rationale**:

- Uses Nitro's `defineHandler` for type-safe handler definition
- Returns plain object; Nitro auto-serializes to JSON with correct Content-Type
- Zero logic, zero dependencies — fastest, most maintainable path
- Matches pattern from `routes/api/healthz-smoke-cancel-407995880.ts`

#### File 2: Integration Test

**Path**: `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts`

**Content**:

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-bugfix-423890514";

describe("GET /api/healthz-smoke-cancel-bugfix-423890514", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-423890514"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "423890514" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-423890514"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Rationale**:

- Tests handler directly via H3Event (no live server needed)
- **Test 1**: Verifies exact response shape (both `ok` and `variant` fields)
- **Test 2**: Verifies performance constraint (health check must be fast)
- Pattern matches `routes/api/healthz-smoke-cancel-407995880.test.ts` (SPRINT-0004)
- Prevents regression: future refactors must pass these tests

### Interface Contract (Specification)

**Endpoint**: `GET /api/healthz-smoke-cancel-bugfix-423890514`

| Aspect           | Value                                        |
| ---------------- | -------------------------------------------- |
| HTTP Method      | GET                                          |
| Path             | `/api/healthz-smoke-cancel-bugfix-423890514` |
| Request Headers  | None required                                |
| Request Body     | None                                         |
| Query Parameters | None                                         |
| Response Status  | 200 OK                                       |
| Response Headers | Content-Type: application/json               |
| Response Body    | `{ok: true, variant: "423890514"}`           |
| Authentication   | None required                                |
| Authorization    | None required                                |
| Database Access  | No                                           |
| Side Effects     | None                                         |
| Performance SLA  | < 100ms                                      |

---

## Definition of Done (DoD)

### Functional DoD

- [ ] File created: `routes/api/healthz-smoke-cancel-bugfix-423890514.ts`
- [ ] File created: `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts`
- [ ] Handler exports via `defineHandler` from Nitro
- [ ] Handler returns exactly: `{ok: true, variant: "423890514"}`
- [ ] Test file imports handler correctly
- [ ] Test 1 passes: Response body matches spec
- [ ] Test 2 passes: Response time < 100ms

### Quality DoD

- [ ] `bun run test` passes (all tests including new ones)
- [ ] `bun run lint` passes (no errors or warnings)
- [ ] `bun run typecheck` passes (TypeScript strict mode)
- [ ] `bun run build` succeeds (Vite SPA + Nitro server)
- [ ] No console errors or warnings during tests

### Verification DoD

- [ ] Manual test: `curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-423890514` returns correct JSON
- [ ] Manual test: HTTP status is 200
- [ ] No regressions: existing tests still pass
- [ ] No conflicts: no route name collisions
- [ ] Git: All changes committed with descriptive message

---

## Testing Strategy

### Test Scope

**In Scope** (required for this fix):

- Response body shape and values
- HTTP status code (200)
- Response time constraint (< 100ms)
- Handler can be called via H3Event pattern

**Out of Scope** (not needed for bugfix):

- E2E/Playwright tests (smoke test doesn't cover individual endpoints)
- Authentication (endpoint has no auth requirement)
- Middleware integration (endpoint is standalone)
- Load testing (health checks are low-volume)

### Test Execution

```bash
# Run all tests (Vitest will pick up new test file)
bun run test

# Run only this endpoint's tests
bun run test routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts

# Watch mode during development
bun run test:watch

# Manual curl test after dev server starts
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-423890514
```

---

## Verification Checklist

- [ ] Endpoint file created with correct handler pattern
- [ ] Test file created with ≥2 test cases
- [ ] Test cases exercise response shape, values, and performance
- [ ] `bun run test` shows new tests passing
- [ ] `bun run lint` shows no errors or warnings
- [ ] `bun run typecheck` succeeds
- [ ] `bun run build` succeeds
- [ ] Manual curl test returns correct JSON
- [ ] No existing tests broken
- [ ] Commit message references VRTX-0032
- [ ] Branch pushed to `vortex/feat/VRTX-0032-*`
- [ ] CI workflow passes

---

## Risks & Mitigations

| Risk                                       | Severity | Mitigation                                                     |
| ------------------------------------------ | -------- | -------------------------------------------------------------- |
| Typo in variant string "423890514"         | Low      | Copy verbatim from VRTX-0032 title; double-check before commit |
| Test isolation or flakiness                | Low      | Tests are pure functions, no shared state or timing deps       |
| Route name collision with another endpoint | Low      | Filename is unique; file-based routing prevents duplicates     |
| CI failure on build/test                   | Low      | Proven pattern from SPRINT-0004/0005; same config              |
| Performance regression in future           | Low      | Test catches if response time exceeds 100ms                    |

---

## References

- **Existing Pattern**: `routes/api/healthz-smoke-cancel-407995880.ts` and test (SPRINT-0004)
- **Second Example**: `routes/api/healthz-smoke-cancel-158110053.ts` and test (SPRINT-0005)
- **Sprint RCA**: `artifacts/SPRINT-0006/SPRINT-PLAN.md`
- **Testing Guide**: `AGENT.md` → "Adding Tests" section
- **Routing Docs**: `ARCHITECTURE.md` → "Routing" section

---

## Next Steps (Execution)

1. ✅ Root cause identified (missing file)
2. ✅ Fix plan written (this document + SPRINT-PLAN.md)
3. Create endpoint handler file: `routes/api/healthz-smoke-cancel-bugfix-423890514.ts`
4. Create test file: `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts`
5. Run tests: `bun run test`
6. Run lint: `bun run lint --fix`
7. Run typecheck: `bun run typecheck`
8. Run build: `bun run build`
9. Manual verification: curl the endpoint
10. Commit changes with reference to VRTX-0032
11. Push to feature branch
12. Wait for CI to pass
13. Transition ticket to done

---

**Fix Scope**: Single missing endpoint (add 2 files, ~50 lines total)  
**Estimated Duration**: < 30 minutes (setup + implementation + testing)  
**Complexity**: Low (identical to SPRINT-0004/0005 pattern, no dependencies)  
**Pattern Reuse**: 100% (exact copy of proven pattern with variant string change)
