# VRTX-0075 — Fix /healthz-smoke-cancel-bugfix-962738443 Endpoint (404 → 200)

**Sprint**: SPRINT-0018  
**Ticket Type**: DEFECT (Bugfix)  
**Complexity**: Very Low  
**Estimated Duration**: < 15 minutes

---

## Summary

The endpoint GET `/api/healthz-smoke-cancel-bugfix-962738443` returns HTTP 404 (Not Found). It should return HTTP 200 with a JSON object `{ok:true, variant:"962738443"}`. Root cause: the route handler file is missing.

---

## Background & Context

**File Ownership Map**:

- `routes/api/healthz-smoke-cancel-bugfix-962738443.ts` — endpoint handler (MISSING)
- `routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts` — test suite (MISSING)

**Related Files** (reference patterns):

- `routes/api/healthz-smoke-bugfix-1054626998.ts` — existing bugfix endpoint pattern
- `routes/api/healthz-smoke-bugfix-1054626998.test.ts` — existing bugfix test pattern
- Other healthz endpoints follow the same pattern

**Architecture Context**:

- **Framework**: Nitro.js (H3 server framework)
- **Routing**: File-based; `routes/api/*.ts` files auto-route to `/api/*` endpoints
- **Testing**: Vitest + H3Event (no live server needed for integration tests)
- **Pattern**: Handlers use `defineHandler()` and return JSON directly

---

## Root Cause Analysis (RCA)

### Defect Details

**Current Behavior**: GET `/api/healthz-smoke-cancel-bugfix-962738443` returns HTTP 404

**Expected Behavior**: GET `/api/healthz-smoke-cancel-bugfix-962738443` returns HTTP 200 with JSON:

```json
{
  "ok": true,
  "variant": "962738443"
}
```

**Repro**:

```bash
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-962738443
# Returns: 404 Not Found
```

### Root Cause

**Primary**: Missing route handler file

The file `routes/api/healthz-smoke-cancel-bugfix-962738443.ts` does not exist. Nitro's file-based routing requires this file to map the route to a handler. Without the file, Nitro cannot resolve the route and returns 404.

**Evidence**:

```bash
ls routes/api/ | grep 962738443
# Returns: (no output — file doesn't exist)
```

### Contributing Factors

1. No corresponding test file exists (`routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`)
2. The endpoint was never implemented despite being in the backlog
3. No one has created this endpoint in any previous sprint

### Impact

- **Severity**: Medium (endpoint completely unavailable)
- **Scope**: 1 endpoint only (no side effects on other endpoints)
- **User Impact**: Smoke tests using this endpoint fail with 404
- **Data Loss**: None (read-only endpoint, no state)

---

## Definition of Done

### Code Implementation

- [ ] Create `routes/api/healthz-smoke-cancel-bugfix-962738443.ts`
  - Use `defineHandler()` from `nitro/h3`
  - Return `{ok:true, variant:"962738443"}`
  - No imports beyond Nitro essentials
  - Follows same structure as `routes/api/healthz-smoke-bugfix-1054626998.ts`
  - File is < 10 lines

- [ ] Create `routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`
  - Test 1: Verify response body is `{ok:true, variant:"962738443"}`
  - Test 2: Verify response time is < 100ms
  - Use H3Event pattern (no live server)
  - Import handler directly and call it with mocked H3Event
  - Include regression test comment explaining the bug

### Verification

- [ ] All tests pass: `bun run test` shows 2+ passing cases for new endpoint
- [ ] No regressions: existing tests still pass
- [ ] Lint passes: `bun run lint` with zero warnings
- [ ] TypeScript passes: `bun run typecheck` succeeds
- [ ] Build succeeds: `bun run build` produces `dist/` and `.output/`

### Git & Review

- [ ] Code committed on feature branch
- [ ] Commit message references ticket and variant
- [ ] Branch pushed to origin
- [ ] CI passes: GitHub Actions all checks green
- [ ] No merge conflicts

---

## Interface Contract

### Endpoint Specification

**Route**: `GET /api/healthz-smoke-cancel-bugfix-962738443`

**Request**:

```
GET /api/healthz-smoke-cancel-bugfix-962738443 HTTP/1.1
Host: localhost:5000
```

- No request body
- No query parameters
- No authentication required
- No headers required

**Response**:

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ok": true,
  "variant": "962738443"
}
```

- Status: 200 OK
- Body: JSON object with `ok` (boolean true) and `variant` (string "962738443") fields
- Response time: < 100ms (enforced by test)

**Side Effects**: None (purely read-only, no state changes)

---

## Implementation Steps

### Step 1: Create Handler File

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

**Checklist**:

- [ ] File created at `routes/api/healthz-smoke-cancel-bugfix-962738443.ts`
- [ ] Uses `defineHandler()` from `nitro/h3`
- [ ] Returns correct object shape: `{ok:true, variant:"962738443"}`
- [ ] Variant is EXACTLY `"962738443"` (not a typo)
- [ ] No extra imports or logic
- [ ] File is clean (no debugging code)

### Step 2: Create Test File

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

**Checklist**:

- [ ] File created at `routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`
- [ ] Imports: H3Event, describe/expect/it from vitest, handler
- [ ] Test 1: Verifies response object shape and values
- [ ] Test 2: Verifies performance (< 100ms)
- [ ] Regression test comment included (explains bug and fix)
- [ ] No live server needed (H3Event is mocked)

### Step 3: Verify Locally

Run all verification commands locally before committing:

```bash
# Run tests for this endpoint only
bun run test -- healthz-smoke-cancel-bugfix-962738443

# Run all tests
bun run test

# Run lint
bun run lint

# Run type check
bun run typecheck

# Build
bun run build

# Full gate (lint + typecheck + test)
bun run verify
```

**Checklist**:

- [ ] `bun run test -- healthz-smoke-cancel-bugfix-962738443` passes (2 tests)
- [ ] Output shows both tests passing:
  - `✓ returns HTTP 200 with correct response body`
  - `✓ responds in under 100ms`
- [ ] `bun run test` passes (no regressions)
- [ ] `bun run lint` passes (zero warnings)
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds (produces dist/ and .output/)
- [ ] Full verification passes: `bun run verify` output shows all green

### Step 4: Manual Verification (Dev Server)

Start the dev server and test the endpoint manually:

```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Test the endpoint
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-962738443

# Expected output:
# {"ok":true,"variant":"962738443"}

# Verify status code
curl -i http://localhost:5000/api/healthz-smoke-cancel-bugfix-962738443

# Should show: HTTP/1.1 200 OK
```

**Checklist**:

- [ ] Dev server starts without errors
- [ ] Endpoint responds with HTTP 200 (not 404)
- [ ] Response body is valid JSON: `{"ok":true,"variant":"962738443"}`
- [ ] Response time is reasonable (< 100ms)

### Step 5: Commit & Push

```bash
# Stage the files
git add routes/api/healthz-smoke-cancel-bugfix-962738443.ts routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts

# Commit with descriptive message
git commit -m "fix: add missing /healthz-smoke-cancel-bugfix-962738443 endpoint

Missing route handler was causing 404 responses. Implement the endpoint
following the established healthz-smoke-bugfix pattern with regression tests.

Endpoint returns {ok:true, variant:\"962738443\"} with HTTP 200.
Tests verify response shape and performance (< 100ms).

Fixes: VRTX-0075
Refs: SPRINT-0018"

# Push to branch
git push -u origin vortex/feat/VRTX-0075-fix-healthz-962738443
```

**Checklist**:

- [ ] Both endpoint and test files staged
- [ ] Commit message is clear and references VRTX-0075
- [ ] Commit message explains the fix (404 → 200)
- [ ] Branch pushed to origin
- [ ] GitHub Actions CI runs and passes all checks

---

## Testing Details

### Unit/Integration Test Pattern

Tests use **H3Event** (Nitro's request mock) — no live server needed.

**Test 1: Response Shape**

```typescript
it("returns HTTP 200 with correct response body", async () => {
  const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-962738443"));
  const result = await handler(event);
  expect(result).toEqual({ ok: true, variant: "962738443" });
});
```

- Creates a fake HTTP request
- Calls the handler with mocked event
- Asserts the response matches expected shape
- **Pass Condition**: `{ok: true, variant: "962738443"}`
- **Fail Condition**: Any deviation in shape or values

**Test 2: Performance**

```typescript
it("responds in under 100ms", async () => {
  const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-962738443"));
  const startTime = performance.now();
  await handler(event);
  const endTime = performance.now();
  const responseTime = endTime - startTime;
  expect(responseTime).toBeLessThan(100);
});
```

- Measures handler execution time using performance.now()
- Asserts response is fast (< 100ms)
- **Pass Condition**: Execution completes in < 100ms
- **Fail Condition**: Execution takes ≥ 100ms (unexpected slowness)

### Running Tests

```bash
# Run only this endpoint's tests
bun run test -- healthz-smoke-cancel-bugfix-962738443

# Run all tests with verbose output
bun run test -- --reporter=verbose

# Run tests in watch mode (for development)
bun run test:watch
```

### Regression Assurance

The test file serves as a regression test. If someone accidentally deletes this endpoint in the future, the test will fail immediately, alerting developers. This prevents this bug from reoccurring.

---

## Success Criteria

### Before Commit

- ✅ Handler file created and follows existing pattern
- ✅ Test file created with 2 test cases
- ✅ `bun run test -- healthz-smoke-cancel-bugfix-962738443` passes
- ✅ `bun run test` passes (no regressions)
- ✅ `bun run lint` passes (zero warnings)
- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds
- ✅ No files outside `routes/api/` modified

### After Push

- ✅ GitHub Actions CI runs on the branch
- ✅ All CI checks pass (lint, typecheck, test, build)
- ✅ No merge conflicts with sprint branch
- ✅ Endpoint returns 200 (not 404) when called

---

## Common Pitfalls & Troubleshooting

| Issue                     | Cause                      | Solution                                                    |
| ------------------------- | -------------------------- | ----------------------------------------------------------- |
| Variant doesn't match     | Typo in variant string     | Double-check: "962738443" (not a number)                    |
| Test fails with 502 error | Handler not default export | Ensure `export default defineHandler(...)`                  |
| Lint fails on formatting  | ESLint/Prettier issues     | Run `bun run lint --fix` to auto-correct                    |
| TypeScript errors         | Missing type imports       | Ensure H3Event import: `import { H3Event } from "nitro/h3"` |
| Performance test fails    | Handler too slow           | Check for unnecessary async/await or blocking operations    |
| Build fails               | Syntax error in endpoint   | Run `bun run typecheck` to find errors                      |

---

## Rollback Plan (if needed)

If this fix somehow causes issues (very unlikely):

1. Delete both files:

   ```bash
   git rm routes/api/healthz-smoke-cancel-bugfix-962738443.ts
   git rm routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts
   ```

2. Revert the commit:

   ```bash
   git revert <commit-hash>
   ```

3. Push the revert:
   ```bash
   git push origin <branch-name>
   ```

**Result**: Endpoint reverts to 404 (pre-fix state)

---

## Related Documentation

- **Reference Endpoint**: `routes/api/healthz-smoke-bugfix-1054626998.ts`
- **Reference Test**: `routes/api/healthz-smoke-bugfix-1054626998.test.ts`
- **Sprint Plan**: `artifacts/SPRINT-0018/SPRINT-PLAN.md`
- **Project Conventions**: `AGENT.md` § File-Based Routing (Backend) & Testing

---

## Checklist for Defect Completion

### Implementation

- [ ] Handler file created (`routes/api/healthz-smoke-cancel-bugfix-962738443.ts`)
- [ ] Test file created (`routes/api/healthz-smoke-cancel-bugfix-962738443.test.ts`)
- [ ] Handler follows existing pattern (healthz-smoke-bugfix-\*)
- [ ] Tests verify response body and performance

### Verification

- [ ] `bun run test -- healthz-smoke-cancel-bugfix-962738443` passes (2 tests)
- [ ] `bun run test` passes (no regressions)
- [ ] `bun run lint` passes (zero warnings)
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] `bun run verify` passes (full gate)
- [ ] Manual curl test shows 200 (not 404)

### Git & Handoff

- [ ] Files committed on feature branch
- [ ] Branch pushed to origin
- [ ] Commit message references VRTX-0075 and SPRINT-0018
- [ ] CI passes on the branch
- [ ] Ready to merge to sprint branch

---

**Defect Plan Written**: 2026-07-26  
**Bug**: /healthz-smoke-cancel-bugfix-962738443 returns 404  
**Fix Complexity**: Very Low (straightforward missing endpoint)  
**Expected Completion**: < 15 minutes (implementation only)  
**Pattern**: Proven in codebase (identical to SPRINT-0012 bugfix endpoints)
