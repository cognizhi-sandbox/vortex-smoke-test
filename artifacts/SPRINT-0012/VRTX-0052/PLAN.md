# VRTX-0052 Defect Plan — /healthz-smoke-cancel-bugfix-488783827 returns 404

**Defect**: VRTX-0052 — /healthz-smoke-cancel-bugfix-488783827 returns 404, should return ok+variant
**Sprint**: SPRINT-0012 (Bugfix)
**Idea**: VST-0011 (related: smoke-cancel-178505799212171)

---

## Defect Summary

**Symptom**: GET `/api/healthz-smoke-cancel-bugfix-488783827` returns HTTP 404

**Expected Behavior**: Returns HTTP 200 with JSON response `{ok:true, variant:"488783827"}`

**Actual Behavior**: HTTP 404 Not Found

**Reproducibility**: 100% — consistent 404 on every request

**User Impact**: Smoke tests expecting this endpoint fail; service appears broken for this health check variant

---

## Root Cause Analysis

### Investigation

**Step 1**: Check for handler file

```bash
ls -la /workspace/repo/routes/api/healthz-smoke-cancel-bugfix-488783827.ts
# Result: File not found
```

**Step 2**: Verify Nitro file-based routing requirements

- Nitro requires each route to correspond to a file in `routes/api/`
- Filename `healthz-smoke-cancel-bugfix-488783827.ts` → route `/api/healthz-smoke-cancel-bugfix-488783827`
- Missing file → no route registered → 404

**Step 3**: Compare against working endpoints

- `routes/api/healthz-smoke-cancel-407995880.ts` exists → route works ✓
- `routes/api/healthz-smoke-bugfix-1054626998.ts` exists → route works ✓
- `routes/api/healthz-smoke-cancel-bugfix-488783827.ts` missing → route 404s ✗

### Root Cause

**PRIMARY**: Missing route handler file `routes/api/healthz-smoke-cancel-bugfix-488783827.ts`

This is a straightforward missing file issue, not a logic error or configuration problem. The Nitro framework will automatically detect and register the route once the file is created.

### Why It Happened

The endpoint was intended as part of the smoke test series but the implementation file was never created. The naming pattern suggests it was planned (similar to other `bugfix-*` and `cancel-*` variants), but the actual file was not added to the repository.

### Why Tests Didn't Catch It

No test file exists either (e.g., `healthz-smoke-cancel-bugfix-488783827.test.ts`), so there's no automated test to detect the missing endpoint. Once the handler and test files are created, automated tests will prevent regression.

---

## Acceptance Criteria (Definition of Done)

1. ✅ Handler file created: `routes/api/healthz-smoke-cancel-bugfix-488783827.ts`
2. ✅ Handler returns `{ok:true, variant:"488783827"}` with HTTP 200
3. ✅ Test file created: `routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts`
4. ✅ Test case 1: Response body matches expected JSON object
5. ✅ Test case 2: Response time is < 100ms
6. ✅ `bun run lint` passes with zero warnings
7. ✅ `bun run typecheck` passes with zero errors
8. ✅ `bun run test` passes (new test passes, existing tests still pass)
9. ✅ `bun run build` succeeds (Vite SPA + Nitro server)
10. ✅ Endpoint now responds with HTTP 200 (404 error resolved)
11. ✅ Code committed on ticket branch with clear commit message
12. ✅ Defect plan committed to `artifacts/SPRINT-0012/VRTX-0052/PLAN.md`

---

## Fix Implementation

### Step 1: Create the Handler

**File**: `routes/api/healthz-smoke-cancel-bugfix-488783827.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "488783827",
  };
});
```

**Why this works**:

- `defineHandler` is Nitro's standard for HTTP route handlers
- Returns a plain object; Nitro automatically serializes to JSON with HTTP 200
- No middleware dependencies (auth, logging, etc.) — pure endpoint
- No database access — instant response

### Step 2: Create the Test Suite

**File**: `routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import handler from "./healthz-smoke-cancel-bugfix-488783827";

/**
 * REGRESSION TEST for smoke bugfix
 *
 * Bug: GET /api/healthz-smoke-cancel-bugfix-488783827 was returning 404
 * Root cause: Missing route handler file
 * Fix: Create the route handler and verify it returns correct response
 */
describe("GET /api/healthz-smoke-cancel-bugfix-488783827", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-488783827"));

    const result = await handler(event);

    expect(result).toEqual({ ok: true, variant: "488783827" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-488783827"));

    const startTime = performance.now();
    await handler(event);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

**Test rationale**:

- H3Event simulates an HTTP request without spinning up a live server
- Two test cases cover the critical path: correct response and performance
- Includes regression test comment documenting the bug and fix
- Follows project pattern from `healthz-smoke-bugfix-1054626998.test.ts`

### Step 3: Verify Locally

```bash
# Format and lint check
bun run lint --fix

# Type check
bun run typecheck

# Run tests (includes new test file)
bun run test

# Full verification
bun run verify

# Build
bun run build

# Optional: Manual test with dev server
bun run dev
# In another terminal:
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-488783827
# Expected response: {"ok":true,"variant":"488783827"}
```

**Expected results**:

- Lint: zero warnings
- TypeScript: zero errors
- Tests: new test file passes with 2 cases
- Build: successful
- Manual test: HTTP 200 with correct JSON

### Step 4: Commit

```bash
git add routes/api/healthz-smoke-cancel-bugfix-488783827.ts
git add routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts
git add artifacts/SPRINT-0012/VRTX-0052/PLAN.md

git commit -m "Fix 404 error on /healthz-smoke-cancel-bugfix-488783827 endpoint (VRTX-0052)

- Create missing route handler: routes/api/healthz-smoke-cancel-bugfix-488783827.ts
- Add regression test: routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts
- Endpoint now returns {ok:true, variant:\"488783827\"} with HTTP 200
- Root cause: handler file was missing from repository
- All verification gates pass: lint, typecheck, test, build"
```

---

## Interface Contract

**Endpoint**: `GET /api/healthz-smoke-cancel-bugfix-488783827`

**Request**:

- Method: GET
- Path: `/api/healthz-smoke-cancel-bugfix-488783827`
- Query params: None
- Body: None
- Auth required: No
- Headers: No special requirements

**Response**:

- Status: 200 OK (fixes the 404 error)
- Content-Type: application/json
- Body: `{ok:true, variant:"488783827"}`

**Performance SLA**: < 100ms response time

**Side Effects**: None (pure computation)

---

## Reference Implementations

**Identical pattern** used in working endpoints:

1. **SPRINT-0004**: `routes/api/healthz-smoke-cancel-407995880.ts` + `.test.ts` (working)
2. **Other bugfix endpoints**:
   - `routes/api/healthz-smoke-bugfix-1054626998.ts` + `.test.ts`
   - `routes/api/healthz-smoke-bugfix2-559758399.ts` + `.test.ts`
   - `routes/api/healthz-smoke-bugfix3-428029175.ts` + `.test.ts`

All are 9 lines for the handler and ~25 lines for the test.

---

## Verification Checklist

Before marking the defect as resolved, verify:

- [ ] `routes/api/healthz-smoke-cancel-bugfix-488783827.ts` exists (9 lines)
- [ ] `routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts` exists (25 lines)
- [ ] Handler returns `{ok:true, variant:"488783827"}` (exact match)
- [ ] Test cases cover response body and performance
- [ ] `bun run lint` passes (zero warnings)
- [ ] `bun run typecheck` passes (zero errors)
- [ ] `bun run test` passes (new tests pass, no regressions)
- [ ] `bun run build` succeeds
- [ ] Manual curl test returns 200 with correct JSON
- [ ] Code committed to ticket branch
- [ ] `artifacts/SPRINT-0012/VRTX-0052/PLAN.md` committed

---

## Testing Strategy

### Unit/Integration Tests

- **Framework**: Vitest + H3Event
- **Environment**: Node.js (via vitest.config.ts)
- **Runtime**: Bun
- **Coverage**: Response correctness and performance

Run tests:

```bash
bun run test
```

Or focused on this endpoint:

```bash
bun run test routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts
```

### CI Validation

GitHub Actions (`.github/workflows/ci.yml`) runs on push:

1. Lint: `bun run lint`
2. TypeScript: `bun run typecheck`
3. Tests: `bun run test`
4. Build: `bun run build`

All gates must pass.

---

## Risks & Mitigations

| Risk                          | Mitigation                                                          |
| ----------------------------- | ------------------------------------------------------------------- |
| Lint/format issues            | Run `bun run lint --fix` before commit                              |
| TypeScript errors             | Run `bun run typecheck` locally first                               |
| Test failures                 | Run tests in isolation to diagnose                                  |
| Variant string mismatch       | Copy exact string from this plan: `"488783827"`                     |
| Regression in other endpoints | Run full test suite; verify no existing tests broken                |
| File not found after creation | Verify both `.ts` and `.test.ts` files are created and added to git |

---

## Success Metrics

- ✅ Endpoint accessible at GET `/api/healthz-smoke-cancel-bugfix-488783827`
- ✅ Returns HTTP 200 (404 error resolved)
- ✅ Response is `{ok:true, variant:"488783827"}` (exact match)
- ✅ Response time < 100ms
- ✅ Tests pass locally: `bun run test`
- ✅ CI passes: all checks green
- ✅ No regressions: existing endpoints and tests unaffected
- ✅ Code follows project conventions
- ✅ Defect is marked resolved

---

## Key Decisions

| Decision                                   | Rationale                                            |
| ------------------------------------------ | ---------------------------------------------------- |
| Create missing handler file                | Fix is straightforward file addition, not a redesign |
| Use identical pattern to working endpoints | Consistency with codebase; proven to work            |
| Include regression test                    | Prevents future 404 errors on this endpoint          |
| No middleware or DB dependencies           | Matches pattern of all other health check endpoints  |
| Lint + typecheck in CI                     | Project zero-warning policy                          |

---

## Related Issues

**Similar past defects** (all fixed by creating missing handler files):

- `healthz-smoke-bugfix-1054626998.ts` (SPRINT in test comments)
- `healthz-smoke-bugfix2-559758399.ts` (SPRINT in test comments)
- `healthz-smoke-bugfix3-428029175.ts` (SPRINT in test comments)

All follow the same root cause pattern and fix approach.

---

**Plan written**: 2026-07-26  
**Defect**: GET /api/healthz-smoke-cancel-bugfix-488783827 returns 404  
**Root Cause**: Missing handler file  
**Fix Complexity**: Low (9 lines for handler, 25 lines for test)  
**Estimated Duration**: < 30 minutes
