# VRTX-0038 Task Plan — Implement /healthz-smoke-cancel-569985850 Endpoint

**Task**: VRTX-0038 — Implement `/healthz-smoke-cancel-569985850` endpoint  
**Sprint**: SPRINT-0007  
**Parent**: VRTX-0037 (Story)

---

## Overview

Implement a single, self-contained GET endpoint at `/api/healthz-smoke-cancel-569985850` that returns a JSON object with `ok: true` and `variant: "569985850"`. No dependencies on middleware, database, or authentication.

---

## Requirements

### Functional Requirements

1. **Endpoint Path**: `/api/healthz-smoke-cancel-569985850`
2. **HTTP Method**: GET
3. **Response Body**: `{ok: true, variant: "569985850"}`
4. **HTTP Status**: 200 OK
5. **Content-Type**: `application/json` (handled by Nitro)
6. **No Side Effects**: Pure read-only handler, no database writes, no cache operations

### Non-Functional Requirements

1. **Performance**: Response time < 100ms
2. **Pattern Compliance**: Follow existing `healthz-smoke-*` endpoint pattern (e.g., `/api/healthz-smoke-cancel-407995880`)
3. **Testing**: Include ≥2 test cases (response shape, performance)
4. **Code Quality**: Pass lint, typecheck, and build without warnings or errors

---

## Interface Contract

### HTTP Request

```
GET /api/healthz-smoke-cancel-569985850
```

- **Headers**: None required
- **Query Parameters**: None
- **Request Body**: None

### HTTP Response

```json
{
  "ok": true,
  "variant": "569985850"
}
```

- **Status Code**: 200
- **Content-Type**: `application/json`

---

## Implementation Strategy

### Step 1: Create Endpoint Handler

**File**: `routes/api/healthz-smoke-cancel-569985850.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "569985850",
  };
});
```

**Rationale**:

- Uses Nitro's `defineHandler` for type-safe handler definition
- Returns plain object; Nitro auto-serializes to JSON
- Zero logic, zero dependencies — fastest possible path

### Step 2: Create Integration Test

**File**: `routes/api/healthz-smoke-cancel-569985850.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-569985850";

describe("GET /api/healthz-smoke-cancel-569985850", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-569985850"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "569985850" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-569985850"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Rationale**:

- Tests handler directly via H3Event (no live server needed)
- Verifies response shape matches spec
- Verifies performance constraint
- Pattern copied from `routes/api/healthz-smoke-cancel-407995880.test.ts`

---

## File/Module Ownership

| File/Module                                         | Owner    | Purpose                |
| --------------------------------------------------- | -------- | ---------------------- |
| `routes/api/healthz-smoke-cancel-569985850.ts`      | engineer | Endpoint handler       |
| `routes/api/healthz-smoke-cancel-569985850.test.ts` | engineer | Integration test suite |
| `artifacts/SPRINT-0007/VRTX-0038/PLAN.md`           | engineer | This plan (reference)  |

---

## Definition of Done

- [ ] Handler file created: `routes/api/healthz-smoke-cancel-569985850.ts`
- [ ] Test file created: `routes/api/healthz-smoke-cancel-569985850.test.ts`
- [ ] Handler returns `{ok: true, variant: "569985850"}` with status 200
- [ ] ≥2 test cases implemented (response shape, performance)
- [ ] All tests pass: `bun run test` exits 0
- [ ] Lint passes: `bun run lint` exits 0
- [ ] TypeScript check passes: `bun run typecheck` exits 0
- [ ] Build succeeds: `bun run build` produces `dist/` and `.output/server/index.mjs`
- [ ] CI green: GitHub Actions checks pass on the feature branch
- [ ] No regressions: existing tests still pass, endpoint does not conflict with others
- [ ] Branch committed and pushed with descriptive message

---

## Testing Strategy

### Test Scope

**In Scope**:

- Response body correctness (shape and values)
- HTTP status code (200)
- Response time (< 100ms)
- Handler can be called via H3Event (no live server dependency)

**Out of Scope**:

- E2E/smoke test (see sprint plan — current smoke test doesn't cover new endpoints)
- Authentication (endpoint has no auth)
- Middleware integration (endpoint runs standalone)
- Load testing (not required for health check)

### Test Execution

```bash
# Run all tests (including the new test)
bun run test

# Run only the new test file
bun run test routes/api/healthz-smoke-cancel-569985850.test.ts

# Watch mode during development
bun run test:watch
```

---

## Verification Checklist

- [ ] Endpoint file created with correct handler export
- [ ] Test file created with ≥2 test cases
- [ ] Test cases exercise response shape, values, and performance
- [ ] `bun run test` shows new tests passing
- [ ] `bun run lint` shows no errors or warnings
- [ ] `bun run typecheck` succeeds
- [ ] `bun run build` succeeds
- [ ] Manual curl test returns correct JSON
- [ ] No existing tests broken
- [ ] Commit message references VRTX-0038
- [ ] Branch pushed to `vortex/feat/VRTX-0038-*`
- [ ] CI workflow triggers and passes

---

## Risks & Mitigations

| Risk                      | Severity | Mitigation                                                  |
| ------------------------- | -------- | ----------------------------------------------------------- |
| Lint/format inconsistency | Low      | Run `bun run lint --fix` to auto-fix before committing      |
| TypeScript errors         | Low      | Run `bun run typecheck` locally before committing           |
| Test isolation issues     | Low      | Test is pure function, no shared state — should always pass |
| CI failure                | Low      | Same setup as SPRINT-0004/0005; proven pattern              |

---

## References

- **Existing Pattern**: `routes/api/healthz-smoke-cancel-407995880.ts` + test
- **Sprint Plan**: `artifacts/SPRINT-0007/SPRINT-PLAN.md`
- **Testing Guide**: `AGENT.md` → "Adding Tests" section
- **Routing Docs**: `ARCHITECTURE.md` → "Routing" section

---

## Next Steps (Sequencing)

1. ✅ Plan complete (this file)
2. Create endpoint handler file
3. Create test file
4. Run tests locally: `bun run test`
5. Run lint: `bun run lint --fix`
6. Run typecheck: `bun run typecheck`
7. Run build: `bun run build`
8. Commit all changes
9. Push to feature branch
10. Wait for CI to pass
11. Transition ticket to `in_review`, then `done`

---

**Task Scope**: Single, focused implementation (handler + test for one endpoint)  
**Estimated Duration**: < 1 hour  
**Complexity**: Low (proven pattern, no dependencies, single file per type)
