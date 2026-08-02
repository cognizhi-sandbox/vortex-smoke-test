# VRTX3-S-0002 Bugfix Sprint Plan

**Sprint Goal:** Fix three missing health check endpoints that currently return 404 instead of 200 with expected JSON responses.

**Sprint Type:** BUGFIX (Commitment-based)

**Status:** Planning Complete

---

## Defects Root Cause Analysis

All three defects share the **same root cause**: the endpoint handler files are missing from the `routes/api/` directory.

### Root Cause

When a request arrives for:

- `GET /api/healthz-smoke-bugfix-106285986`
- `GET /api/healthz-smoke-bugfix2-524723214`
- `GET /api/healthz-smoke-bugfix3-764107669`

The Nitro server cannot find the corresponding route handler files, so it falls back to serving the frontend SPA index.html, which the browser interprets as a 200 response with HTML content. When tested via curl or direct HTTP requests, this appears as a valid response but with the wrong content type and status code (404 or HTML fallback).

**Root Cause Confirmed via Testing:**

- All three endpoints currently return the SPA HTML fallback instead of JSON
- No route files exist at `routes/api/healthz-smoke-bugfix-106285986.ts`, etc.
- No test files exist for these routes

---

## Fix Strategy

Create three self-contained, independent Nitro route handlers following the established pattern from prior health check endpoints (e.g., `routes/api/healthz-smoke-302960562-a.ts`):

1. **No code sharing** - Each endpoint is completely self-contained
2. **No external dependencies** - No auth, no database, no middleware dependency
3. **Simple response** - Return `{ ok: true, variant: "<variant>" }` where variant is the unique ID
4. **Test pattern** - Each route gets an H3Event integration test with two checks:
   - Correct JSON response body
   - Performance baseline (< 100ms)

---

## Fix Plans by Ticket

### VRTX3-T-0007: `/api/healthz-smoke-bugfix-106285986`

**File:** `artifacts/VRTX3-S-0002/VRTX3-T-0007/PLAN.md`

**Changes Required:**

- Create `routes/api/healthz-smoke-bugfix-106285986.ts` with handler returning `{ ok: true, variant: "106285986" }`
- Create `routes/api/healthz-smoke-bugfix-106285986.test.ts` with H3Event integration tests

**Expected Outcome:** `GET /api/healthz-smoke-bugfix-106285986` returns HTTP 200 with JSON `{ ok: true, variant: "106285986" }`

---

### VRTX3-T-0008: `/api/healthz-smoke-bugfix2-524723214`

**File:** `artifacts/VRTX3-S-0002/VRTX3-T-0008/PLAN.md`

**Changes Required:**

- Create `routes/api/healthz-smoke-bugfix2-524723214.ts` with handler returning `{ ok: true, variant: "524723214" }`
- Create `routes/api/healthz-smoke-bugfix2-524723214.test.ts` with H3Event integration tests

**Expected Outcome:** `GET /api/healthz-smoke-bugfix2-524723214` returns HTTP 200 with JSON `{ ok: true, variant: "524723214" }`

---

### VRTX3-T-0009: `/api/healthz-smoke-bugfix3-764107669`

**File:** `artifacts/VRTX3-S-0002/VRTX3-T-0009/PLAN.md`

**Changes Required:**

- Create `routes/api/healthz-smoke-bugfix3-764107669.ts` with handler returning `{ ok: true, variant: "764107669" }`
- Create `routes/api/healthz-smoke-bugfix3-764107669.test.ts` with H3Event integration tests

**Expected Outcome:** `GET /api/healthz-smoke-bugfix3-764107669` returns HTTP 200 with JSON `{ ok: true, variant: "764107669" }`

---

## Implementation Notes

- All three endpoints follow the **exact same pattern** as `routes/api/healthz-smoke-302960562-a.ts` (and other recent health check endpoints)
- No coordination needed between fixes — can be implemented and tested independently
- No changes to `vite.config.ts`, middleware, or other shared infrastructure required
- Tests run under `bun run test` with Vitest; no special test setup needed
- No observable behavior change to AGENT.md / PRODUCT.md / ARCHITECTURE.md / DESIGN.md

---

## Acceptance Criteria for Sprint

- [x] Root cause identified and documented for all three defects
- [x] Fix strategy defined (self-contained route handlers + tests)
- [ ] VRTX3-T-0007 fixed and verified (test: `bun run test routes/api/healthz-smoke-bugfix-106285986.test.ts`)
- [ ] VRTX3-T-0008 fixed and verified (test: `bun run test routes/api/healthz-smoke-bugfix2-524723214.test.ts`)
- [ ] VRTX3-T-0009 fixed and verified (test: `bun run test routes/api/healthz-smoke-bugfix3-764107669.test.ts`)
- [ ] All tests passing: `bun run verify` returns success
- [ ] Curl tests confirm HTTP 200 + correct JSON for all three endpoints

---

## Follow-ups / Out of Scope

None identified. All defects are straightforward missing endpoints with a consistent pattern.
