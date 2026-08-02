# VRTX3-T-0014: Fix /api/healthz-smoke-bugfix2-59156521 → 404

**Defect ID:** smoke-bugfix-17856540658772  
**Endpoint:** GET `/api/healthz-smoke-bugfix2-59156521`  
**Variant ID:** 59156521

---

## Problem Statement

The endpoint `/api/healthz-smoke-bugfix2-59156521` returns HTTP 404 Not Found. Expected behavior: HTTP 200 with response body `{"ok":true,"variant":"59156521"}`.

### Reproduction Steps

```bash
curl http://localhost:5000/api/healthz-smoke-bugfix2-59156521
# Expected: HTTP 200 with JSON response
# Actual: HTTP 404 Not Found
```

---

## Root Cause

The route file `routes/api/healthz-smoke-bugfix2-59156521.ts` **does not exist**. Nitro's file-based router has no handler for this endpoint, so all requests return 404.

---

## Fix

Create two files following the established healthz endpoint pattern:

### File 1: `routes/api/healthz-smoke-bugfix2-59156521.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "59156521",
  };
});
```

**Rationale:**

- Simple H3 handler (no middleware, auth, or database)
- Returns hardcoded JSON response with the variant ID
- Self-contained; no shared code with other endpoints

### File 2: `routes/api/healthz-smoke-bugfix2-59156521.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-bugfix2-59156521";

describe("GET /api/healthz-smoke-bugfix2-59156521", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-59156521"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "59156521" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-59156521"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Rationale:**

- Tests the handler in isolation using H3Event (integration test, no live server)
- Verifies correct response body structure and values
- Verifies response latency (<100ms)
- Follows the Vitest + H3Event pattern from `routes/api/healthz-smoke-bugfix-106285986.test.ts`

---

## Definition of Done

- [ ] `routes/api/healthz-smoke-bugfix2-59156521.ts` created with specified handler
- [ ] `routes/api/healthz-smoke-bugfix2-59156521.test.ts` created with both test cases passing
- [ ] `bun run lint` passes (no Prettier or ESLint warnings)
- [ ] `bun run typecheck` passes (full TypeScript type safety)
- [ ] `bun run test` passes (Vitest: this route's tests + all existing tests)
- [ ] Curl reproduction step returns HTTP 200 with correct JSON when running `bun run dev`
- [ ] No changes to other endpoints, docs, or configuration files
- [ ] Committed on sprint branch `vortex/sprint/vrtx3-s-0003-c7a412cb` with clear message

---

## Verification

After implementation:

```bash
# Test via Vitest
bun run test routes/api/healthz-smoke-bugfix2-59156521.test.ts

# Test via dev server (requires running `bun run dev` in another terminal)
curl http://localhost:5000/api/healthz-smoke-bugfix2-59156521
# Should return: {"ok":true,"variant":"59156521"}
```

---

## Notes

- This is a **self-contained endpoint** with no dependencies on other routes, database, auth, or business logic.
- The pattern is copy-paste from existing working healthz endpoints; no novel implementation.
- No changes to root docs or configuration required (observable behavior change only).
