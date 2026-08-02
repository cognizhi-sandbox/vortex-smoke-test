# VRTX3-S-0003: Bugfix Sprint – Three Missing Health Check Endpoints

**Sprint Goal:** Fix three missing health check endpoints returning 404 errors instead of expected 200 with JSON responses.

**Sprint Branch:** `vortex/sprint/vrtx3-s-0003-c7a412cb`

---

## Overview

This sprint addresses three defects where HTTP GET requests to health check endpoints return 404 Not Found instead of the expected HTTP 200 with a simple JSON response body (`{ ok: true, variant: "<id>" }`).

### Defects Committed

1. **VRTX3-T-0013**: `/api/healthz-smoke-bugfix-26031336` → 404 (missing)
2. **VRTX3-T-0014**: `/api/healthz-smoke-bugfix2-59156521` → 404 (missing)
3. **VRTX3-T-0015**: `/api/healthz-smoke-bugfix3-200192357` → 404 (missing)

---

## Root Cause Analysis (RCA)

### Problem

All three endpoints are **completely missing from the route registry**. The Nitro server has no corresponding route files under `routes/api/`, so incoming HTTP GET requests match no route handler and return 404 Not Found.

### Investigation Steps Performed

1. Verified routes don't exist: `ls -la /workspace/repo/routes/api/healthz-smoke-bugfix-26031336*` → No such file or directory (and same for the other two)
2. Examined existing working healthz endpoints (e.g., `/api/healthz-smoke-bugfix-106285986`) to confirm pattern
3. Verified the pattern is simple: single H3 handler returning `{ ok: true, variant: "<id>" }` with corresponding test

### Root Cause

**Missing route files.** The Nitro file-based router derives routes from files in `routes/api/`. Each missing endpoint needs a `.ts` file at:

- `routes/api/healthz-smoke-bugfix-26031336.ts`
- `routes/api/healthz-smoke-bugfix2-59156521.ts`
- `routes/api/healthz-smoke-bugfix3-200192357.ts`

Each route also needs a corresponding test file (required by Vitest configuration to exclude tests from production bundle).

---

## Fix Plan

### Pattern & Implementation

Each endpoint follows an identical, self-contained pattern with **no shared code** and **no database or auth dependencies**:

1. **Route File** (`routes/api/healthz-smoke-bugfix-<id>.ts`):

   ```typescript
   import { defineHandler } from "nitro/h3";

   export default defineHandler(() => {
     return {
       ok: true,
       variant: "<id>",
     };
   });
   ```

2. **Test File** (`routes/api/healthz-smoke-bugfix-<id>.test.ts`):

   ```typescript
   import { H3Event } from "nitro/h3";
   import { describe, expect, it } from "vitest";

   import healthz from "./healthz-smoke-bugfix-<id>";

   describe("GET /api/healthz-smoke-bugfix-<id>", () => {
     it("returns HTTP 200 with correct response body", async () => {
       const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-<id>"));
       const result = await healthz(event);
       expect(result).toEqual({ ok: true, variant: "<id>" });
     });

     it("responds in under 100ms", async () => {
       const event = new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-<id>"));
       const start = Date.now();
       await healthz(event);
       const elapsed = Date.now() - start;
       expect(elapsed).toBeLessThan(100);
     });
   });
   ```

### Files to Create (per ticket)

| Ticket       | Endpoint ID | Route File                                      | Test File                                            |
| ------------ | ----------- | ----------------------------------------------- | ---------------------------------------------------- |
| VRTX3-T-0013 | 26031336    | `routes/api/healthz-smoke-bugfix-26031336.ts`   | `routes/api/healthz-smoke-bugfix-26031336.test.ts`   |
| VRTX3-T-0014 | 59156521    | `routes/api/healthz-smoke-bugfix2-59156521.ts`  | `routes/api/healthz-smoke-bugfix2-59156521.test.ts`  |
| VRTX3-T-0015 | 200192357   | `routes/api/healthz-smoke-bugfix3-200192357.ts` | `routes/api/healthz-smoke-bugfix3-200192357.test.ts` |

### Dependencies

- **VRTX3-T-0013** → **VRTX3-T-0014** → **VRTX3-T-0015**: No file conflicts; can be worked in any order.
- No dependencies on external services, database, auth, or other code.
- Each endpoint is a standalone implementation; fixes can be applied independently or in parallel.

---

## Acceptance Criteria Summary

✅ All three route files created and implement the specified pattern  
✅ All three test files created and pass (HTTP 200, correct JSON, <100ms)  
✅ No lint/type/test errors across the project  
✅ Reproduction steps documented in per-ticket PLAN.md files  
✅ Observable behavior changes documented in `CLAUDE.md` changelog after merge

---

## Per-Ticket Plans

See detailed implementation and acceptance criteria in:

- `artifacts/VRTX3-S-0003/VRTX3-T-0013/PLAN.md`
- `artifacts/VRTX3-S-0003/VRTX3-T-0014/PLAN.md`
- `artifacts/VRTX3-S-0003/VRTX3-T-0015/PLAN.md`

---

## Follow-ups / Out of Scope

None identified during root-cause analysis.
