# VRTX-0051 Task Plan — Implement /healthz-smoke-cancel-548090782 endpoint

**Task**: VRTX-0051 — Implement /healthz-smoke-cancel-548090782 endpoint
**Sprint**: SPRINT-0011
**Story**: VRTX-0050 — Implement Endpoint & Tests
**Epic**: VRTX-0049 — Add /healthz-smoke-cancel-548090782 Endpoint
**Idea**: VST-0011 — [smoke-cancel-178505799212171] /healthz-smoke-cancel-548090782 endpoint

---

## Overview

This task implements a simple GET API endpoint `/api/healthz-smoke-cancel-548090782` that returns a JSON response `{ok:true, variant:"548090782"}` with HTTP 200. The endpoint is self-contained with no dependencies on database, middleware, or auth systems.

This is the fourth identical health check endpoint in the codebase (following SPRINT-0004, SPRINT-0005, SPRINT-0007). The pattern is proven and tested — implementation is straightforward.

---

## Acceptance Criteria (Definition of Done)

1. ✅ Endpoint handler in `routes/api/healthz-smoke-cancel-548090782.ts` returns `{ok:true, variant:"548090782"}` with HTTP 200
2. ✅ Integration test file in `routes/api/healthz-smoke-cancel-548090782.test.ts` with ≥2 test cases
3. ✅ Test case 1: Response body matches expected JSON object `{ok:true, variant:"548090782"}`
4. ✅ Test case 2: Response time is < 100ms
5. ✅ `bun run lint` passes with zero warnings
6. ✅ `bun run typecheck` passes with zero errors
7. ✅ `bun run test` passes (new test cases pass, existing tests still pass)
8. ✅ `bun run build` succeeds (Vite SPA + Nitro server output valid)
9. ✅ Code committed on ticket branch with clear commit message
10. ✅ Task plan committed to `artifacts/SPRINT-0011/VRTX-0051/PLAN.md`

---

## Implementation Steps

### Step 1: Create the Endpoint Handler

**File**: `routes/api/healthz-smoke-cancel-548090782.ts`

**Pattern** (copy from `routes/api/healthz-smoke-cancel-407995880.ts`):

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "548090782",
  };
});
```

**Why this pattern**:

- `defineHandler` is Nitro's standard for HTTP handlers
- Returns a plain object; Nitro serializes it to JSON with Content-Type: application/json
- No middleware dependencies (auth, logging, etc.) — handler runs standalone
- No database access — pure compute

### Step 2: Create the Test Suite

**File**: `routes/api/healthz-smoke-cancel-548090782.test.ts`

**Pattern** (copy from `routes/api/healthz-smoke-cancel-407995880.test.ts`):

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-548090782";

describe("GET /api/healthz-smoke-cancel-548090782", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-548090782"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "548090782" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-548090782"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Why this pattern**:

- H3Event simulates an HTTP request without spinning up a live server
- Two test cases cover happy path: response shape and performance
- Vitest is configured for `routes/**/*.test.ts` with `environment: "node"`
- Tests run under Bun with `bun run test`

### Step 3: Run Local Verification

**Verify the implementation** before pushing:

```bash
# Format and fix lint issues
bun run lint --fix

# Type check
bun run typecheck

# Run tests (including the new test file)
bun run test

# Full verification (lint + typecheck + test)
bun run verify

# Build (Vite SPA + Nitro server)
bun run build
```

**Expected output**:

- Lint: zero warnings
- TypeScript: zero errors
- Tests: new test file passes with 2+ cases
- Build: `dist/` folder and `.output/server/index.mjs` created successfully

### Step 4: Commit Changes

**Commit both the implementation and this task plan**:

```bash
git add routes/api/healthz-smoke-cancel-548090782.ts
git add routes/api/healthz-smoke-cancel-548090782.test.ts
git add artifacts/SPRINT-0011/VRTX-0051/PLAN.md

git commit -m "Implement /healthz-smoke-cancel-548090782 endpoint (VRTX-0051)

- Add GET /api/healthz-smoke-cancel-548090782 returning {ok:true, variant:\"548090782\"}
- Add integration tests: response shape and performance (< 100ms)
- Follows existing health check pattern from SPRINT-0004/0005/0007
- All verification gates pass: lint, typecheck, test, build"
```

**Push to your ticket branch**:

```bash
git push -u origin vortex/feat/VRTX-0048-sprint-plan-sprint-0011-39c0838b
```

---

## File Summary

### New Files

| File                                                | Purpose                | Notes                              |
| --------------------------------------------------- | ---------------------- | ---------------------------------- |
| `routes/api/healthz-smoke-cancel-548090782.ts`      | Endpoint handler       | 9 lines; returns static JSON       |
| `routes/api/healthz-smoke-cancel-548090782.test.ts` | Integration test suite | 25 lines; 2+ test cases            |
| `artifacts/SPRINT-0011/VRTX-0051/PLAN.md`           | This task plan         | Committed alongside implementation |

### Modified Files

None (this is a pure addition; no existing files change).

---

## Interface Contract

**Endpoint**: `GET /api/healthz-smoke-cancel-548090782`

**Request**:

- Method: GET
- Path: `/api/healthz-smoke-cancel-548090782`
- Query params: None
- Body: None
- Auth required: No
- Headers: No special requirements

**Response**:

- Status: 200 OK
- Content-Type: application/json (set by Nitro)
- Body: `{ok:true, variant:"548090782"}`

**Performance SLA**: Response time < 100ms (per project health check pattern)

**Side Effects**: None (pure computation, no DB writes, no logging to external systems)

---

## Reference Implementations

The following existing endpoints follow the identical pattern and can be referenced:

1. **SPRINT-0004**: `routes/api/healthz-smoke-cancel-407995880.ts` + `.test.ts`
2. **SPRINT-0005**: `routes/api/healthz-smoke-cancel-158110053.ts` + `.test.ts`
3. **SPRINT-0007**: `routes/api/healthz-smoke-cancel-569985850.ts` + `.test.ts`

All are 9 lines for the handler and ~25 lines for the test suite.

---

## Testing Strategy

### Unit/Integration Tests (Vitest + H3Event)

- **Environment**: Node.js (via `vitest.config.ts` `server` project)
- **Runtime**: Bun (required for test execution)
- **Framework**: Vitest + H3Event (no live server needed)
- **Coverage**: Response body and performance

**Run locally**:

```bash
bun run test
```

Or focused on this endpoint:

```bash
bun run test routes/api/healthz-smoke-cancel-548090782.test.ts
```

### CI Verification

GitHub Actions (`.github/workflows/ci.yml`) runs on push to `vortex/feat/*` and `vortex/sprint/*` branches:

1. Lint: `bun run lint`
2. TypeScript: `bun run typecheck`
3. Tests: `bun run test`
4. Build: `bun run build`
5. Optional: `bun run test:smoke` (E2E)

All gates must pass before the ticket can be marked done.

---

## Verification Checklist

Before transitioning the task to done, verify:

- [ ] `routes/api/healthz-smoke-cancel-548090782.ts` exists and matches pattern
- [ ] `routes/api/healthz-smoke-cancel-548090782.test.ts` exists with 2+ test cases
- [ ] `bun run lint` passes (zero warnings)
- [ ] `bun run typecheck` passes (zero errors)
- [ ] `bun run test` passes (new tests pass, no regressions)
- [ ] `bun run build` succeeds
- [ ] Code committed to ticket branch
- [ ] `artifacts/SPRINT-0011/VRTX-0051/PLAN.md` committed
- [ ] Branch pushed to origin
- [ ] CI status is green on GitHub

---

## Risks & Mitigations

| Risk                    | Mitigation                                         |
| ----------------------- | -------------------------------------------------- |
| Lint/format issues      | Run `bun run lint --fix` before committing         |
| TypeScript errors       | Run `bun run typecheck` locally first              |
| Test failures           | Run `bun run test --reporter=verbose` to diagnose  |
| CI timeout              | No infra changes; build should be instant          |
| Variant string mismatch | Copy-paste carefully from this plan: `"548090782"` |

---

## Key Decisions

| Decision                   | Rationale                                                 |
| -------------------------- | --------------------------------------------------------- |
| Single file endpoint       | Minimal scope; no composition or routing needed           |
| Vitest + H3Event for tests | Matches project convention; no server spin-up             |
| Returns `{ok, variant}`    | Per spec; matches other health check endpoints            |
| No middleware dependencies | Pure handler; faster, easier to test, fewer failure modes |
| Lint + typecheck in CI     | Zero-warning policy enforced by project                   |

---

## Success Criteria Summary

✅ Endpoint implementation complete  
✅ Tests written and passing  
✅ All verification gates green (lint, typecheck, test, build)  
✅ Code committed on ticket branch  
✅ No regressions in existing tests  
✅ Ready for merge into sprint branch

---

**Plan written**: 2026-07-26  
**Estimated duration**: < 1 hour (straightforward pattern, proven implementations available)  
**Complexity**: Low (copy-paste pattern, no new concepts or dependencies)
