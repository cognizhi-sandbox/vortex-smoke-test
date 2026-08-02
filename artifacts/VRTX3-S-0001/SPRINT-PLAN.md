# VRTX3-S-0001 Bugfix Sprint Plan

**Sprint**: VRTX3-S-0001  
**Planning Date**: 2026-08-02  
**Defects**: 3 health check endpoint defects  
**Regression Risk**: Low (net-new endpoints with no dependents)

---

## Executive Summary

Three health check endpoint variant routes are missing from the Nitro server, causing 404 responses where 200 OK with JSON responses are expected. These are minimal, self-contained endpoints following the pattern established by earlier sprints (SPRINT-0004, SPRINT-0005, SPRINT-0019). Each defect requires:

1. A new route file under `routes/api/` with a trivial handler
2. A corresponding H3Event-based integration test
3. No shared code, no auth, no database access

All three fixes follow the same pattern and can be parallelized.

---

## Defect Details & Root Causes

### VRTX3-T-0001: Missing `/api/healthz-smoke-bugfix-508914715`

**Defect**: GET `/api/healthz-smoke-bugfix-508914715` returns 404 instead of 200 with `{"ok":true,"variant":"508914715"}`

**Root Cause**: No route handler exists for this endpoint in `routes/api/`. The file `routes/api/healthz-smoke-bugfix-508914715.ts` is missing.

**Evidence**:

- Grep on `routes/api/` finds no match for `508914715`
- Similar endpoints exist (e.g., `healthz-smoke-cancel-407995880.ts`) proving the pattern
- Reproduce: `curl http://localhost:5000/api/healthz-smoke-bugfix-508914715` → 404

**Fix Plan**: Add `routes/api/healthz-smoke-bugfix-508914715.ts` with the same pattern as existing health endpoints. See `VRTX3-T-0001/PLAN.md`.

---

### VRTX3-T-0002: Missing `/api/healthz-smoke-bugfix2-473664326`

**Defect**: GET `/api/healthz-smoke-bugfix2-473664326` returns 404 instead of 200 with `{"ok":true,"variant":"473664326"}`

**Root Cause**: No route handler exists for this endpoint in `routes/api/`. The file `routes/api/healthz-smoke-bugfix2-473664326.ts` is missing.

**Evidence**:

- Grep on `routes/api/` finds no match for `473664326`
- Similar endpoints exist (e.g., `healthz-smoke-bugfix2-559758399.ts`) proving the pattern
- Reproduce: `curl http://localhost:5000/api/healthz-smoke-bugfix2-473664326` → 404

**Fix Plan**: Add `routes/api/healthz-smoke-bugfix2-473664326.ts` with the same pattern as existing health endpoints. See `VRTX3-T-0002/PLAN.md`.

---

### VRTX3-T-0003: Missing `/api/healthz-smoke-bugfix3-429794134`

**Defect**: GET `/api/healthz-smoke-bugfix3-429794134` returns 404 instead of 200 with `{"ok":true,"variant":"429794134"}`

**Root Cause**: No route handler exists for this endpoint in `routes/api/`. The file `routes/api/healthz-smoke-bugfix3-429794134.ts` is missing.

**Evidence**:

- Grep on `routes/api/` finds no match for `429794134`
- Similar endpoints exist (e.g., `healthz-smoke-bugfix3-428029175.ts`) proving the pattern
- Reproduce: `curl http://localhost:5000/api/healthz-smoke-bugfix3-429794134` → 404

**Fix Plan**: Add `routes/api/healthz-smoke-bugfix3-429794134.ts` with the same pattern as existing health endpoints. See `VRTX3-T-0003/PLAN.md`.

---

## Implementation Strategy

### Pattern & Template

All three fixes follow the established Nitro file-based routing pattern:

**Route File** (`routes/api/healthz-smoke-bugfix*-<variant>.ts`):

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "<variant-id>",
  };
});
```

**Test File** (`routes/api/healthz-smoke-bugfix*-<variant>.test.ts`):

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-bugfix*-<variant>";

describe("GET /api/healthz-smoke-bugfix*-<variant>", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix*-<variant>"));
    const result = await healthz(event);
    expect(result).toEqual({ ok: true, variant: "<variant-id>" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix*-<variant>"));
    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

### Parallel Execution

All three fixes are independent (different files, different variants, no shared state). They can be implemented and tested in parallel. Dependencies: none.

---

## Regression Analysis

**Scope**: Adding 3 net-new endpoints; no modifications to existing routes.

**Risk**: **Low**

- No existing code depends on these endpoints (new)
- File-based routing in Nitro means each endpoint is isolated
- No database, auth, or shared utility access
- Nitro router prioritizes exact matches; no shadowing risk

**Testing Strategy**: Each route has its own H3Event-based test covering:

- Response body format (JSON with `ok: true` and `variant` field)
- HTTP status (implied 200 by handler return)
- Performance (< 100ms)

**Existing Tests**: Run `bun run verify` (lint + typecheck + test) to confirm no regressions.

---

## Follow-ups / Out of Scope

None identified in this sprint.

---

## Files to Commit

- `routes/api/healthz-smoke-bugfix-508914715.ts`
- `routes/api/healthz-smoke-bugfix-508914715.test.ts`
- `routes/api/healthz-smoke-bugfix2-473664326.ts`
- `routes/api/healthz-smoke-bugfix2-473664326.test.ts`
- `routes/api/healthz-smoke-bugfix3-429794134.ts`
- `routes/api/healthz-smoke-bugfix3-429794134.test.ts`
- `artifacts/VRTX3-S-0001/SPRINT-PLAN.md`
- `artifacts/VRTX3-S-0001/VRTX3-T-0001/PLAN.md`
- `artifacts/VRTX3-S-0001/VRTX3-T-0002/PLAN.md`
- `artifacts/VRTX3-S-0001/VRTX3-T-0003/PLAN.md`
