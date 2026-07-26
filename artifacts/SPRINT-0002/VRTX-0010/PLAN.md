# Plan — VRTX-0010: Implement health check endpoint variant C

## Objective

Implement the third independent health check endpoint at `GET /api/healthz-smoke-126862920-c` as a standalone Nitro route with no shared code, no database access, no authentication, and no dependencies on other endpoints. This endpoint is completely independent from VRTX-0008 (endpoint A) and VRTX-0009 (endpoint B).

---

## Implementation Steps

### 1. Create the Route File

**File**: `routes/api/healthz-smoke-126862920-c.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => {
  return {
    ok: true,
    variant: "126862920",
  };
});
```

**Design notes**:

- Use the same `defineHandler` + H3 pattern as existing routes (see `routes/api/hello.ts`)
- No middleware dependencies (event.context is not accessed)
- No database access
- No external dependencies
- Response is a plain JavaScript object (auto-serialized to JSON by Nitro)
- No request body parsing or query parameter handling
- Response time: < 1ms (no async operations)

### 2. Create the Integration Test

**File**: `routes/api/healthz-smoke-126862920-c.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzC from "./healthz-smoke-126862920-c";

describe("GET /api/healthz-smoke-126862920-c", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-126862920-c"));

    const result = await healthzC(event);

    expect(result).toEqual({ ok: true, variant: "126862920" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-126862920-c"));

    const start = Date.now();
    await healthzC(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Design notes**:

- Pattern: `H3Event` + direct handler call, matching `routes/api/hello.test.ts`
- No HTTP server or network call involved
- Test runs in Vitest Node environment
- Two test cases:
  1. Response body correctness
  2. Response time under 100ms
- No mock data or setup needed

### 3. Typecheck

```bash
bun run typecheck
```

- Should pass with no errors
- Verify no type errors in the new route or test file

### 4. Lint

```bash
bun run lint
```

- Should pass with zero warnings
- Auto-fixable issues (spacing, quotes) fixed by Prettier

### 5. Test

```bash
bun run test
```

- New test in `routes/api/healthz-smoke-126862920-c.test.ts` must pass
- All existing tests must continue to pass
- VRTX-0008 (endpoint A) and VRTX-0009 (endpoint B) tests should also still pass

### 6. Build

```bash
bun run build
```

- Vite SPA → `dist/`
- Nitro server → `.output/server/index.mjs`
- Verify new route is included in the Nitro bundle (no build errors)

### 7. Manual Dev Server Test (Optional)

```bash
bun run dev
```

Then in another terminal:

```bash
curl http://localhost:5000/api/healthz-smoke-126862920-c
```

Expected response:

```json
{ "ok": true, "variant": "126862920" }
```

---

## File/Module Ownership

This TASK creates:

| File/Path                                      | Operation | Notes                           |
| ---------------------------------------------- | --------- | ------------------------------- |
| `routes/api/healthz-smoke-126862920-c.ts`      | Create    | Route handler for endpoint C    |
| `routes/api/healthz-smoke-126862920-c.test.ts` | Create    | Integration test for endpoint C |

**No other TASKs should modify these files** during this sprint. These files are exclusive to VRTX-0010.

**No file overlap with other TASKs**: VRTX-0008 creates `healthz-smoke-126862920-a.*`, VRTX-0011 creates `healthz-smoke-126862920-b.*`, VRTX-0013 verifies docs only.

---

## Interface Contracts

### Fixed Route Interface

**Endpoint**: `GET /api/healthz-smoke-126862920-c`

**HTTP Status**: MUST return HTTP 200

**Response Body** (JSON):

```json
{
  "ok": true,
  "variant": "126862920"
}
```

- `"ok"` MUST be `true` (boolean)
- `"variant"` MUST be exactly `"126862920"` (string)
- No additional fields allowed (for spec compliance)

**Response Time**: MUST be < 100ms (no async operations, no I/O)

**No Request Headers Required**: The endpoint ignores all request headers

**No Request Body**: GET request, no body

### Fixed Test Interface

- Test file MUST use the `H3Event` + handler pattern
- Test file MUST be located at `routes/api/healthz-smoke-126862920-c.test.ts`
- Test file MUST use Vitest (`describe`, `expect`, `it`)
- Test file MUST be automatically excluded from production bundle (via `nitro({ ignore: ["**/*.test.ts"] })` in `vite.config.ts`)

---

## Definition of Done

✅ `routes/api/healthz-smoke-126862920-c.ts` created with correct handler  
✅ `routes/api/healthz-smoke-126862920-c.test.ts` created with passing tests  
✅ `bun run typecheck` passes (no errors)  
✅ `bun run lint` passes (zero warnings)  
✅ `bun run test` passes (new test + all existing tests + VRTX-0008 & VRTX-0009 tests)  
✅ `bun run build` succeeds (`dist/` and `.output/server/index.mjs` exist)  
✅ Manual `curl` test confirms endpoint responds with correct body  
✅ Response time verified < 100ms  
✅ Both files committed on ticket branch  
✅ `artifacts/SPRINT-0002/VRTX-0010/PLAN.md` committed
