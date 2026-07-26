# SPRINT-0006 Plan — Bugfix: /healthz-smoke-cancel-bugfix-423890514 Missing Endpoint

**Sprint Goal**: Fix missing health check endpoint that should return `{ok:true, variant:"423890514"}`.

**Idea**: VST-0006 — [smoke-cancel-178505122854648] /healthz-smoke-cancel-bugfix-423890514 returns 404

---

## Executive Summary

**Defect**: GET `/api/healthz-smoke-cancel-bugfix-423890514` returns HTTP 404 (Not Found).

**Expected Behavior**: GET `/api/healthz-smoke-cancel-bugfix-423890514` should return HTTP 200 with response body `{ok:true, variant:"423890514"}`.

**Root Cause**: The endpoint file `routes/api/healthz-smoke-cancel-bugfix-423890514.ts` does not exist. The endpoint is missing from the codebase entirely.

**Impact**: Any service consumer attempting to call this health check endpoint receives a 404 error instead of a successful health confirmation.

**Fix**: Add the missing endpoint handler and integration test following the established pattern from SPRINT-0004 and SPRINT-0005.

---

## Defect Details

### Ticket: VRTX-0032

**Summary**: `/healthz-smoke-cancel-bugfix-423890514` returns 404, should return ok+variant

**Reproduction Steps**:

```bash
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-423890514
# Expected: {"ok":true,"variant":"423890514"}
# Actual: 404 Not Found
```

**Severity**: Low (simple endpoint, no data loss, no security impact)

---

## Root Cause Analysis (RCA)

### Investigation

1. **File Check**: Searched `/workspace/repo/routes/api/` for files matching `*bugfix-423890514*`
   - Result: No files found for this specific variant
   - Other bugfix endpoints exist (1054626998, 559758399, 428029175) with proper implementations

2. **Pattern Verification**: Reviewed existing health check endpoints from SPRINT-0004 and SPRINT-0005
   - `routes/api/healthz-smoke-cancel-407995880.ts` exists and returns the expected format
   - `routes/api/healthz-smoke-cancel-158110053.ts` exists and returns the expected format
   - Both follow identical pattern: `defineHandler` returning `{ok: true, variant: "..."}`

3. **Routing Configuration**: Verified Nitro routing configuration in `vite.config.ts`
   - Correct `serverDir: "./"` setting ensures all files in `routes/api/` are scanned
   - No exclusion rules prevent this endpoint from being discovered

### Root Cause

**Primary Cause**: The endpoint file `routes/api/healthz-smoke-cancel-bugfix-423890514.ts` is missing from the codebase.

**Why This Happened**: This is a regression from a previous sprint. The endpoint should have been created but was either:

- Not implemented in the expected sprint
- Created and then accidentally deleted
- Never created despite being specified in requirements

**Secondary Factors**:

- No integration test prevents regression detection
- File-based routing means missing file = missing endpoint (no explicit registry)

---

## Fix Strategy

### Fix Type: Add Missing Endpoint

**Objective**: Create the missing endpoint handler and its integration test.

**Solution**:

1. Create `routes/api/healthz-smoke-cancel-bugfix-423890514.ts` with the standard handler
2. Create `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts` with ≥2 test cases
3. Verify fix: `bun run test` and endpoint responds with 200 + correct JSON

### Implementation Details

**File 1: Handler** — `routes/api/healthz-smoke-cancel-bugfix-423890514.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "423890514",
  };
});
```

**File 2: Test** — `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-bugfix-423890514";

describe("GET /api/healthz-smoke-cancel-bugfix-423890514", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-423890514"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "423890514" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-bugfix-423890514"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

### Interface Contract (Fixed)

**Endpoint**: `GET /api/healthz-smoke-cancel-bugfix-423890514`

- **Request**: No body, no query params, no auth
- **Response**: `{ok:true, variant:"423890514"}` (JSON, HTTP 200)
- **Side Effects**: None
- **Dependencies**: None (standalone, no middleware/DB/auth)

---

## Files to Create/Update

### New Files (Fix)

- `routes/api/healthz-smoke-cancel-bugfix-423890514.ts` — missing endpoint handler
- `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts` — integration test
- `artifacts/SPRINT-0006/VRTX-0032/PLAN.md` — fix plan (this document's reference)

### Modified Files

None — this is an additive fix (no changes to existing code).

### Root Docs

No updates required — adding an endpoint doesn't change observable behavior of existing features.

---

## Testing Plan

### Unit/Integration Tests

**Test File**: `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts`

- **Test 1**: Response body correctness
  - Verifies `ok` field is `true`
  - Verifies `variant` field is `"423890514"`
- **Test 2**: Performance constraint
  - Verifies response time < 100ms
  - Matches pattern from SPRINT-0004 and SPRINT-0005

**Execution**:

```bash
bun run test
```

### Manual Verification

After fix:

```bash
# Start dev server in one terminal
bun run dev

# In another terminal, test the endpoint
curl http://localhost:5000/api/healthz-smoke-cancel-bugfix-423890514
# Expected output: {"ok":true,"variant":"423890514"}
```

### Regression Testing

Existing tests should continue to pass:

```bash
bun run test
bun run lint
bun run typecheck
bun run build
```

---

## Definition of Done

- [x] Root cause identified: missing endpoint file
- [x] Fix plan written: create handler + test
- [ ] Endpoint handler created: `routes/api/healthz-smoke-cancel-bugfix-423890514.ts`
- [ ] Test file created: `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts` with ≥2 test cases
- [ ] Handler returns `{ok:true, variant:"423890514"}` with HTTP 200
- [ ] Tests pass: `bun run test` exits 0
- [ ] Lint passes: `bun run lint` exits 0
- [ ] TypeScript check passes: `bun run typecheck` exits 0
- [ ] Build succeeds: `bun run build` exits 0
- [ ] Manual test passes: curl endpoint returns expected JSON
- [ ] No regressions: existing tests still pass
- [ ] Ticket transitioned to done

---

## Risks & Mitigations

| Risk                              | Severity | Mitigation                                            |
| --------------------------------- | -------- | ----------------------------------------------------- |
| Copy-paste error in variant value | Low      | Use string "423890514" verbatim from the defect title |
| Test isolation issues             | Low      | Tests are pure functions, no shared state             |
| CI failure                        | Low      | Proven pattern; same setup as SPRINT-0004/0005        |
| New endpoint conflicts with route | Low      | File-based routing is unique per filename             |

---

## Success Criteria

- ✅ GET `/api/healthz-smoke-cancel-bugfix-423890514` returns HTTP 200
- ✅ Response body is exactly `{ok:true, variant:"423890514"}`
- ✅ Tests pass locally and in CI
- ✅ No regressions in existing endpoints or tests
- ✅ Code follows project conventions (Nitro, Vitest, H3Event pattern)

---

## Ticket Summary

| Ticket    | Type   | Title                                              | Dependencies | Owner    |
| --------- | ------ | -------------------------------------------------- | ------------ | -------- |
| VRTX-0032 | DEFECT | /healthz-smoke-cancel-bugfix-423890514 returns 404 | VRTX-0034    | engineer |

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0006: Bugfix — Missing Endpoint

**Defect**: `/healthz-smoke-cancel-bugfix-423890514` endpoint returned 404 instead of 200.

**Root Cause**: Endpoint file missing from `routes/api/`.

**Fix**: Added `routes/api/healthz-smoke-cancel-bugfix-423890514.ts` and integration test. Endpoint now returns `{ok:true, variant:"423890514"}` with HTTP 200.

**Files Added**:

- `routes/api/healthz-smoke-cancel-bugfix-423890514.ts` — endpoint handler
- `routes/api/healthz-smoke-cancel-bugfix-423890514.test.ts` — integration test

---

**Plan written**: 2026-07-26  
**Sprint Goal**: Fix missing health check endpoint  
**Expected Duration**: < 30 minutes (straightforward add, proven pattern)  
**Complexity**: Low (identical to SPRINT-0004/0005 implementation pattern)
