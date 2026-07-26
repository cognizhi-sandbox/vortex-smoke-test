# SPRINT-0020 Bugfix Plan

## Sprint Goal

Fix three missing API health check endpoints that are returning 404 instead of 200 with health status.

## Root-Cause Analysis

### Common Pattern

All three defects follow the same pattern:

- A Nitro HTTP endpoint is missing from `routes/api/`
- The route should be a self-contained handler that returns `{ok: true, variant: "<variant-id>"}`
- Each variant is isolated and has its own route file and test

### Reproduction Method

Each endpoint can be tested via curl:

```bash
curl http://localhost:5000/api/healthz-smoke-bugfix-248794935
curl http://localhost:5000/api/healthz-smoke-bugfix2-601069474
curl http://localhost:5000/api/healthz-smoke-bugfix3-458270372
```

Current behavior: All return HTML (404 page) because the route files do not exist.
Expected behavior: All should return JSON `200 {"ok":true,"variant":"<variant-id>"}`.

### Technical Details

- The codebase already has working examples at `routes/api/healthz-smoke-cancel-407995880.ts` and other similar endpoints
- Each existing example returns the same structure: `{ok:true, variant:"<id>"}`
- Each has a corresponding test file with two test cases:
  1. Response body validation (HTTP 200, correct JSON)
  2. Performance validation (response < 100ms)

## Fix Plan

### Fix 1: VRTX-0090 - /api/healthz-smoke-bugfix-248794935

**File:** `routes/api/healthz-smoke-bugfix-248794935.ts`
**Content:** Create a simple Nitro handler that returns `{ok:true,variant:"248794935"}`
**Test:** Create `routes/api/healthz-smoke-bugfix-248794935.test.ts` following the established pattern
**PLAN:** See `artifacts/SPRINT-0020/VRTX-0090/PLAN.md`

### Fix 2: VRTX-0091 - /api/healthz-smoke-bugfix2-601069474

**File:** `routes/api/healthz-smoke-bugfix2-601069474.ts`
**Content:** Create a simple Nitro handler that returns `{ok:true,variant:"601069474"}`
**Test:** Create `routes/api/healthz-smoke-bugfix2-601069474.test.ts` following the established pattern
**PLAN:** See `artifacts/SPRINT-0020/VRTX-0091/PLAN.md`

### Fix 3: VRTX-0092 - /api/healthz-smoke-bugfix3-458270372

**File:** `routes/api/healthz-smoke-bugfix3-458270372.ts`
**Content:** Create a simple Nitro handler that returns `{ok:true,variant:"458270372"}`
**Test:** Create `routes/api/healthz-smoke-bugfix3-458270372.test.ts` following the established pattern
**PLAN:** See `artifacts/SPRINT-0020/VRTX-0092/PLAN.md`

## Implementation Notes

- No auth required (middleware is not involved)
- No database access (fully self-contained)
- No shared code with other endpoints (each is independent)
- All three fixes follow the same pattern, so can be implemented in parallel
- No changes to root documentation (these are isolated endpoints with no observable behavior impact on existing APIs)
