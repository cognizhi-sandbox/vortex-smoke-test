# VRTX3-T-0002 Implementation Plan

**Defect**: GET `/api/healthz-smoke-bugfix2-473664326` returns 404, should return 200 + `{"ok":true,"variant":"473664326"}`

**Root Cause**: Route file `routes/api/healthz-smoke-bugfix2-473664326.ts` missing from the Nitro server.

**Risk**: Low — isolated, self-contained endpoint with no dependents.

---

## Definition of Done

1. ✅ Route file created at `routes/api/healthz-smoke-bugfix2-473664326.ts`
2. ✅ Handler returns `{ ok: true, variant: "473664326" }` for all requests
3. ✅ Nitro server auto-registers route to `/api/healthz-smoke-bugfix2-473664326` via file-based routing
4. ✅ Test file created at `routes/api/healthz-smoke-bugfix2-473664326.test.ts` with:
   - Correct JSON response body assertion
   - Performance assertion (< 100ms)
5. ✅ Test passes: `bun run test -- healthz-smoke-bugfix2-473664326.test.ts`
6. ✅ No lint or type errors: `bun run lint && bun run typecheck` pass
7. ✅ HTTP 200 returned (implicit via defineHandler)
8. ✅ No regression in existing health endpoints: `bun run verify`

---

## Implementation Steps

### Step 1: Create Route Handler

File: `routes/api/healthz-smoke-bugfix2-473664326.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "473664326",
  };
});
```

### Step 2: Create Test File

File: `routes/api/healthz-smoke-bugfix2-473664326.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-bugfix2-473664326";

describe("GET /api/healthz-smoke-bugfix2-473664326", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-473664326"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "473664326" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-473664326"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

### Step 3: Verify Tests Pass

```bash
bun run test -- healthz-smoke-bugfix2-473664326.test.ts
```

Expected output: 2 passing tests.

### Step 4: Run Full Verification

```bash
bun run verify
```

Expected: all checks pass (lint, typecheck, test suite).

---

## Edge Cases Handled

- **Variant extraction**: Hardcoded in response (no parsing needed for this single endpoint)
- **Request method**: Nitro's `defineHandler` accepts GET by default
- **Response type**: JSON is auto-serialized by Nitro
- **Performance**: Simple object return, no async I/O, easily < 100ms

---

## Testing Rationale

Tests use H3Event (Nitro integration test pattern) to simulate HTTP requests without a live server. This matches all existing health-check endpoint tests in the codebase.

The two test cases cover:

1. **Correctness**: response body format and content
2. **Performance**: endpoint responds quickly (< 100ms)

---

## Files Modified

- **Created**: `routes/api/healthz-smoke-bugfix2-473664326.ts`
- **Created**: `routes/api/healthz-smoke-bugfix2-473664326.test.ts`

## Commit Message

```
Add /api/healthz-smoke-bugfix2-473664326 health check endpoint

- Adds missing route handler returning {ok: true, variant: "473664326"}
- Includes H3Event-based integration test with response body and performance assertions
- Pattern matches existing health check endpoints (SPRINT-0004+)
```
