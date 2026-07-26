# SPRINT-0012 Bugfix Plan — /healthz-smoke-cancel-bugfix-488783827 Missing Endpoint

**Sprint Goal**: Fix 404 error on GET /healthz-smoke-cancel-bugfix-488783827; return expected health check response.

**Defect**: VRTX-0052 — [smoke-cancel-178505799212171] /healthz-smoke-cancel-bugfix-488783827 returns 404, should return ok+variant

---

## Summary

GET `/api/healthz-smoke-cancel-bugfix-488783827` currently returns HTTP 404. Expected behavior: return HTTP 200 with JSON response `{ok:true, variant:"488783827"}`. The endpoint is self-contained with no dependencies on auth, database, or complex middleware.

### Root Cause

**Missing route handler file**: `routes/api/healthz-smoke-cancel-bugfix-488783827.ts` does not exist. Nitro file-based routing requires the handler file to be present for the route to respond; its absence causes a 404.

### Reproduction

```bash
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-488783827
# Returns: 404 Not Found
```

Expected:

```json
{
  "ok": true,
  "variant": "488783827"
}
```

### Fix Plan

Create the missing endpoint handler file and its corresponding test suite, following the pattern established by other health check endpoints (both working endpoints like `healthz-smoke-cancel-407995880` and other bugfix endpoints like `healthz-smoke-bugfix-1054626998`).

---

## Defects and Fixes

### Defect 1: VRTX-0052

**Title**: /healthz-smoke-cancel-bugfix-488783827 returns 404, should return ok+variant

**Issue**: Endpoint is missing entirely (no handler file)

**Impact**: Smoke tests expecting this endpoint fail with 404; service appears broken for this health check variant

**Fix**: Create endpoint handler + test files (identical to working endpoints)

**Files to Create**:

- `routes/api/healthz-smoke-cancel-bugfix-488783827.ts` (endpoint handler)
- `routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts` (test suite)
- `artifacts/SPRINT-0012/VRTX-0052/PLAN.md` (detailed fix plan)

**Interface Contract**:

- **Endpoint**: `GET /api/healthz-smoke-cancel-bugfix-488783827`
- **Response**: `{ok:true, variant:"488783827"}` with HTTP 200
- **Performance**: < 100ms response time

---

## Phases

### Phase 1: Root Cause Analysis ✓ (THIS TICKET)

- [x] Investigate 404 error on the endpoint
- [x] Locate missing files and understand file-based routing requirements
- [x] Compare against working endpoints (SPRINT-0004, etc.) and other bugfix endpoints
- [x] Identify root cause: missing handler file
- [x] Write RCA and fix plan
- [x] Create DEFECT ticket(s)

**Deliverables**: SPRINT-PLAN.md (this file), DEFECT ticket (VRTX-0052) with acceptance criteria

---

### Phase 2: Implementation (VRTX-0052)

**Task**: Create `/healthz-smoke-cancel-bugfix-488783827` endpoint

**Work**:

- Create `routes/api/healthz-smoke-cancel-bugfix-488783827.ts` using the Nitro `defineHandler` pattern
- Handler returns `{ok:true, variant:"488783827"}` with HTTP 200
- Create corresponding test file: `routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts`
- Tests verify:
  - Response body matches expected object
  - HTTP status code is 200
  - Response is fast (< 100ms)

**Definition of Done**:

- Handler file created and follows existing pattern
- Test file written with ≥2 test cases (response shape, performance)
- All tests pass: `bun run test` succeeds
- Lint passes: `bun run lint` succeeds
- TypeScript check passes: `bun run typecheck` succeeds
- Build succeeds: `bun run build` produces valid output
- 404 error resolved; endpoint now returns 200 with correct response

---

### Phase 3: Test Harness

**Scope**: Covered within Phase 2

- Unit/integration tests via Vitest (`routes/**/*.test.ts`)
- Real H3Event pattern (no live server required)
- Pattern: Copy from working endpoints

**Test Coverage**:

- Response body shape and values (`{ok:true, variant:"488783827"}`)
- HTTP status code (200)
- Response time (< 100ms)
- No middleware dependencies

---

### Phase 4: CI

**GitHub Actions** (`.github/workflows/` — already in place):

Triggered on push to `vortex/sprint/*` and `vortex/feat/*` branches:

1. **Lint**: `bun run lint` — ESLint 9 + typescript-eslint + Prettier
2. **TypeScript**: `bun run typecheck` — full project type check
3. **Tests**: `bun run test` — Vitest on all `.test.ts` files
4. **Build**: `bun run build` — Vite SPA + Nitro server
5. **E2E Smoke** (optional): `bun run test:smoke`

**Success Criteria**: All checks pass; endpoint returns 200 with correct response

---

## Root Cause Analysis

| Aspect              | Finding                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Bug**             | GET /api/healthz-smoke-cancel-bugfix-488783827 returns 404                                                                     |
| **Root Cause**      | Missing route handler file: `routes/api/healthz-smoke-cancel-bugfix-488783827.ts`                                              |
| **Why it happens**  | Nitro file-based routing requires each route to have a corresponding `.ts` file; absence → 404                                 |
| **How we know**     | Comparing against working endpoints in same directory (all have both .ts handler and .test.ts files)                           |
| **Similar issues**  | Other bugfix endpoints (e.g., `healthz-smoke-bugfix-1054626998.ts`) follow identical pattern; endpoint was created to fix them |
| **Regression risk** | Low — fix is purely additive (no changes to existing working endpoints)                                                        |

---

## Files to Create

### New Files

| File                                                       | Purpose           | Size (approx) |
| ---------------------------------------------------------- | ----------------- | ------------- |
| `routes/api/healthz-smoke-cancel-bugfix-488783827.ts`      | Endpoint handler  | 9 lines       |
| `routes/api/healthz-smoke-cancel-bugfix-488783827.test.ts` | Integration test  | 25 lines      |
| `artifacts/SPRINT-0012/VRTX-0052/PLAN.md`                  | Detailed fix plan | 200+ lines    |

### Files Not Modified

All other files remain unchanged — this is a pure addition with no breaking changes.

---

## Testing Strategy

### Unit/Integration Tests (Vitest)

Pattern (from `routes/api/healthz-smoke-cancel-407995880.test.ts`):

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

### Verification

Local verification before push:

```bash
bun run lint       # Zero warnings
bun run typecheck  # Zero errors
bun run test       # New test passes, existing tests unaffected
bun run build      # Successful build
```

Manual verification (optional):

```bash
bun run dev        # Start dev server
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-488783827
# Should return: {"ok":true,"variant":"488783827"}
```

---

## Success Criteria

- ✅ Endpoint now accessible at GET `/api/healthz-smoke-cancel-bugfix-488783827`
- ✅ Returns HTTP 200 with JSON `{ok:true, variant:"488783827"}`
- ✅ Response time < 100ms
- ✅ Tests pass: `bun run test`
- ✅ Lint passes: `bun run lint`
- ✅ TypeScript check passes: `bun run typecheck`
- ✅ Build succeeds: `bun run build`
- ✅ No regressions in existing endpoints or tests
- ✅ Code committed on ticket branch

---

## Reference Implementations

The following endpoints use the identical pattern and can be referenced:

**Working health check endpoints**:

- `routes/api/healthz-smoke-cancel-407995880.ts` + `.test.ts` (SPRINT-0004)
- `routes/api/healthz-smoke-cancel-569985850.ts` + `.test.ts` (SPRINT-0007)

**Other bugfix endpoints** (same pattern):

- `routes/api/healthz-smoke-bugfix-1054626998.ts` + `.test.ts`
- `routes/api/healthz-smoke-bugfix2-559758399.ts` + `.test.ts`
- `routes/api/healthz-smoke-bugfix3-428029175.ts` + `.test.ts`

All follow the same 9-line handler + 25-line test pattern.

---

## Risks & Mitigations

| Risk                          | Mitigation                                           |
| ----------------------------- | ---------------------------------------------------- |
| Lint/format issues            | Run `bun run lint --fix` before commit               |
| TypeScript errors             | Run `bun run typecheck` locally first                |
| Test failures                 | Run tests in isolation to diagnose                   |
| Variant string mismatch       | Copy from this plan: `"488783827"`                   |
| Regression in other endpoints | Run full test suite; verify no existing tests broken |

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0012 (Bugfix)

**Defect**: GET /api/healthz-smoke-cancel-bugfix-488783827 returning 404

**Root Cause**: Missing route handler file

**Fix**: Create endpoint handler and test files for `/healthz-smoke-cancel-bugfix-488783827`, returning `{ok:true, variant:"488783827"}` with HTTP 200.

**Related**: Similar to other bugfix endpoints in the series (bugfix-1054626998, bugfix2-559758399, bugfix3-428029175).

---

## Ticket Summary

| Ticket    | Type   | Title                                                                        | Dependencies     | Owner    |
| --------- | ------ | ---------------------------------------------------------------------------- | ---------------- | -------- |
| VRTX-0052 | DEFECT | /healthz-smoke-cancel-bugfix-488783827 returns 404, should return ok+variant | VRTX-0054 (plan) | engineer |

**Total Scope**: 1 DEFECT ticket (fix for missing endpoint).

---

## Next Steps (Post-Sprint)

1. Engineer implements VRTX-0052: creates endpoint handler + tests
2. CI validates (lint, typecheck, test, build)
3. Ticket transitions to done
4. Defect is resolved; endpoint now accessible and returns correct response

---

**Plan written**: 2026-07-26  
**Sprint Goal**: Fix 404 error on missing health check endpoint  
**Expected Duration**: < 30 minutes (create two simple files following established pattern)  
**Complexity**: Low (identical to existing working endpoints, no new concepts)
