# VRTX-0074 — Implement /healthz-smoke-cancel-508640794 Endpoint

**Sprint**: SPRINT-0017  
**Task Type**: Implementation (Engineer)  
**Complexity**: Low  
**Estimated Duration**: < 30 minutes

---

## Summary

Implement a single, self-contained GET endpoint at `/api/healthz-smoke-cancel-508640794` that returns a JSON object with an `ok` field set to `true` and a `variant` field set to the string `"508640794"`. The endpoint has no dependencies, no auth, and no database access.

---

## Background & Context

**File Ownership Map**:

- `routes/api/healthz-smoke-cancel-508640794.ts` — endpoint handler (NEW)
- `routes/api/healthz-smoke-cancel-508640794.test.ts` — test suite (NEW)

**Related Files** (reference patterns):

- `routes/api/healthz-smoke-cancel-407995880.ts` — existing endpoint pattern to copy
- `routes/api/healthz-smoke-cancel-407995880.test.ts` — existing test pattern to copy
- `routes/api/` — file-based routing convention (one endpoint file per route)

**Architecture Context**:

- **Framework**: Nitro.js (H3 server framework)
- **Routing**: File-based; `routes/api/*.ts` files auto-route to `/api/*` endpoints
- **Testing**: Vitest + H3Event (no live server needed for integration tests)
- **Pattern**: Handlers use `defineHandler()` and return JSON directly

---

## Definition of Done

### Code Implementation

- [ ] Create `routes/api/healthz-smoke-cancel-508640794.ts`
  - Use `defineHandler()` from `nitro/h3`
  - Return `{ok:true, variant:"508640794"}`
  - No imports beyond Nitro essentials
  - Follows same structure as `healthz-smoke-cancel-407995880.ts`

- [ ] Create `routes/api/healthz-smoke-cancel-508640794.test.ts`
  - Test 1: Verify response body is `{ok:true, variant:"508640794"}`
  - Test 2: Verify response time is < 100ms
  - Use H3Event pattern (no live server)
  - Import handler directly and call it with mocked H3Event

### Verification

- [ ] All tests pass: `bun run test` shows 2+ passing cases for new endpoint
- [ ] Lint passes: `bun run lint` with zero warnings
- [ ] TypeScript passes: `bun run typecheck` succeeds
- [ ] Build succeeds: `bun run build` produces `dist/` and `.output/`
- [ ] No regressions: existing tests and endpoints still pass

### Git & Review

- [ ] Code committed on `vortex/feat/VRTX-0075-*` branch
- [ ] Commit message references task and endpoint variant
- [ ] Branch pushed to origin
- [ ] No merge conflicts with sprint branch

---

## Interface Contract

### Endpoint Specification

**Route**: `GET /api/healthz-smoke-cancel-508640794`

**Request**:

```
GET /api/healthz-smoke-cancel-508640794 HTTP/1.1
Host: localhost:5000
```

- No request body
- No query parameters
- No authentication required
- No headers required

**Response**:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ok": true,
  "variant": "508640794"
}
```

- Status: 200 OK
- Body: JSON object with `ok` (boolean) and `variant` (string) fields
- Response time: < 100ms (enforced by test)

**Side Effects**: None (purely read-only, no state changes)

---

## Implementation Steps

### Step 1: Create Handler File

**File**: `routes/api/healthz-smoke-cancel-508640794.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "508640794",
  };
});
```

**Reference**: See `routes/api/healthz-smoke-cancel-407995880.ts` for exact pattern.

**Checklist**:

- [ ] File created in `routes/api/`
- [ ] Uses `defineHandler()` from `nitro/h3`
- [ ] Returns correct object shape
- [ ] Variant is exactly `"508640794"`
- [ ] No extra imports or logic

### Step 2: Create Test File

**File**: `routes/api/healthz-smoke-cancel-508640794.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-508640794";

describe("GET /api/healthz-smoke-cancel-508640794", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-508640794"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "508640794" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-508640794"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Reference**: See `routes/api/healthz-smoke-cancel-407995880.test.ts` for exact pattern.

**Checklist**:

- [ ] File created in `routes/api/`
- [ ] Imports: H3Event, describe/expect/it from vitest, handler
- [ ] Test 1: Verifies response object shape and values
- [ ] Test 2: Verifies performance (< 100ms)
- [ ] No live server needed (H3Event is mocked)

### Step 3: Verify Locally

Run all verification commands locally before committing:

```bash
# Run tests for this endpoint
bun run test -- healthz-smoke-cancel-508640794

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

- [ ] `bun run test -- healthz-smoke-cancel-508640794` passes (2+ tests)
- [ ] `bun run test` passes (no regressions)
- [ ] `bun run lint` passes (zero warnings)
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds

### Step 4: Commit & Push

```bash
# Stage the files
git add routes/api/healthz-smoke-cancel-508640794.ts routes/api/healthz-smoke-cancel-508640794.test.ts

# Commit with descriptive message
git commit -m "feat: add /healthz-smoke-cancel-508640794 endpoint

Implement a simple GET endpoint returning {ok:true, variant:\"508640794\"}.
Includes integration tests verifying response shape and performance.

Refs: VRTX-0075, VST-0017"

# Push to branch
git push -u origin vortex/feat/VRTX-0075-implement-healthz-508640794
```

**Checklist**:

- [ ] Both endpoint and test files staged
- [ ] Commit message is clear and references task/idea
- [ ] Branch pushed to origin
- [ ] CI runs and passes (check GitHub Actions)

---

## Testing Details

### Unit/Integration Test Pattern

Tests use **H3Event** (Nitro's request mock) — no live server needed.

**Test 1: Response Shape**

```typescript
it("returns HTTP 200 with correct response body", async () => {
  const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-508640794"));
  const result = await healthz(event);
  expect(result).toEqual({ ok: true, variant: "508640794" });
});
```

- Creates a fake HTTP request
- Calls the handler with the mocked event
- Asserts the response object matches expected shape
- **Pass Condition**: `{ok: true, variant: "508640794"}`

**Test 2: Performance**

```typescript
it("responds in under 100ms", async () => {
  const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-508640794"));
  const start = Date.now();
  await healthz(event);
  const elapsed = Date.now() - start;
  expect(elapsed).toBeLessThan(100);
});
```

- Measures handler execution time
- Asserts response is fast (< 100ms)
- **Pass Condition**: Execution completes in < 100ms

### Running Tests

```bash
# Run only this endpoint's tests
bun run test -- healthz-smoke-cancel-508640794

# Run all tests with verbose output
bun run test -- --reporter=verbose

# Run tests in watch mode (for development)
bun run test:watch
```

---

## Success Criteria

### Before Commit

- ✅ Endpoint code is under 10 lines (simple handler)
- ✅ Test code has 2+ test cases
- ✅ `bun run test` passes (all tests green)
- ✅ `bun run lint` passes (zero warnings)
- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds without errors
- ✅ No files outside `routes/api/` modified

### After Push

- ✅ GitHub Actions CI runs on the branch
- ✅ All CI checks pass (lint, typecheck, test, build)
- ✅ No merge conflicts with sprint branch

---

## Common Pitfalls & Troubleshooting

| Issue                      | Solution                                                                      |
| -------------------------- | ----------------------------------------------------------------------------- |
| Lint fails on formatting   | Run `bun run lint --fix` to auto-correct format                               |
| Test fails with 502 error  | Ensure handler is default export and uses `defineHandler()` correctly         |
| Variant doesn't match      | Double-check variant string is exactly `"508640794"` (not a typo)             |
| Performance test times out | Handler is too slow; check for unnecessary async/await or blocking operations |
| TypeScript errors          | Ensure H3Event and vitest types are imported; run `bun run typecheck`         |

---

## Related Documentation

- **Endpoint Pattern**: `routes/api/healthz-smoke-cancel-407995880.ts`
- **Test Pattern**: `routes/api/healthz-smoke-cancel-407995880.test.ts`
- **Project Conventions**: `AGENT.md` § Testing
- **File-Based Routing**: `AGENT.md` § File-Based Routing (Backend)
- **Sprint Plan**: `artifacts/SPRINT-0017/SPRINT-PLAN.md`

---

## Checklist for Task Completion

### Implementation

- [ ] Handler file created (`routes/api/healthz-smoke-cancel-508640794.ts`)
- [ ] Test file created (`routes/api/healthz-smoke-cancel-508640794.test.ts`)
- [ ] Handler follows existing pattern
- [ ] Tests verify response body and performance

### Verification

- [ ] `bun run test` passes (2+ new tests)
- [ ] `bun run lint` passes (zero warnings)
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] `bun run verify` passes (full gate)

### Git & Handoff

- [ ] Files committed on feature branch
- [ ] Branch pushed to origin
- [ ] Commit message references task (VRTX-0075) and idea (VST-0017)
- [ ] CI passes on the branch
- [ ] Ready for merge to sprint branch

---

**Task Plan Written**: 2026-07-26  
**Expected Completion**: Same day (< 30 minutes work)  
**Pattern**: Proven in codebase (multiple `healthz-smoke-*` endpoints exist)
