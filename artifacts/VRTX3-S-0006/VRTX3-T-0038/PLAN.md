# TASK Plan — VRTX3-T-0034

**Title:** Implement `/api/healthz-smoke-913793173-a`

**Parent Epic:** VRTX3-E-0006 — Add Three Independent Health Check Endpoints (913793173)

**Sprint:** VRTX3-S-0006

**Created:** 2026-08-05

---

## Overview

Add a simple GET endpoint at `/api/healthz-smoke-913793173-a` that returns `{ "ok": true, "variant": "913793173" }`. This endpoint is completely self-contained with no shared code, middleware, or database dependencies.

## File Ownership Map

### Create

- `routes/api/healthz-smoke-913793173-a.ts` — Route handler (Nitro H3 handler, 10 lines)
- `routes/api/healthz-smoke-913793173-a.test.ts` — Integration test (Vitest + H3Event, ~25 lines)

### Modify

None. This is purely additive.

## Implementation

### 1. Route Handler: `routes/api/healthz-smoke-913793173-a.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "913793173",
  };
});
```

**Key points:**

- Uses Nitro's `defineHandler` for type safety
- No async logic (synchronous return)
- No imports from other routes or utilities
- No database access, no auth, no middleware
- Nitro automatically:
  - Sets `Content-Type: application/json`
  - Serializes object to JSON
  - Returns HTTP 200 on success

### 2. Integration Test: `routes/api/healthz-smoke-913793173-a.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-913793173-a";

describe("GET /api/healthz-smoke-913793173-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-913793173-a"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "913793173" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-913793173-a"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Key points:**

- Uses H3Event to test handler without live server
- Two test cases: response body + latency
- No setup or teardown needed (stateless handler)
- Follows pattern from existing endpoints (SPRINT-0004, SPRINT-0005, etc.)

## Verification Checklist

- [ ] Route file created at `routes/api/healthz-smoke-913793173-a.ts`
- [ ] Test file created at `routes/api/healthz-smoke-913793173-a.test.ts`
- [ ] `bun run lint` passes (no Prettier/ESLint warnings)
- [ ] `bun run typecheck` passes (no TypeScript errors)
- [ ] `bun run test` passes (both test cases pass)
- [ ] `bun run build` succeeds (route bundled into server)
- [ ] Manual verification via `bun run dev` → `curl http://localhost:5000/api/healthz-smoke-913793173-a` returns correct JSON

## Acceptance Criteria

- ✅ Route file `routes/api/healthz-smoke-913793173-a.ts` exists
- ✅ Endpoint responds to GET requests with HTTP 200
- ✅ Response body is exactly `{ "ok": true, "variant": "913793173" }`
- ✅ Response `Content-Type` is `application/json`
- ✅ Response time is <100ms (no blocking I/O, no database)
- ✅ Integration test file `routes/api/healthz-smoke-913793173-a.test.ts` exists and passes
- ✅ Test covers: HTTP 200 status, correct response body, <100ms latency
- ✅ No shared dependencies with other endpoints
- ✅ `bun run lint` passes
- ✅ `bun run typecheck` passes
- ✅ `bun run test` passes

## Dependencies

None. This endpoint has no dependencies on other routes, middleware, or services.

## Timeline

**Estimated:** ~30 minutes

1. Create `routes/api/healthz-smoke-913793173-a.ts` (5 min)
2. Create `routes/api/healthz-smoke-913793173-a.test.ts` (5 min)
3. Run `bun run verify` locally (10 min)
4. Iterate on any failures (5–10 min typical, 0 min if pattern is followed exactly)

## Related Documentation

- Sprint Plan: [VRTX3-S-0006/SPRINT-PLAN.md](../SPRINT-PLAN.md)
- Operating Manual: [AGENT.md](../../../AGENT.md#adding-tests)
- Existing pattern reference: `routes/api/healthz-smoke-302960562-a.ts` and `.test.ts`
