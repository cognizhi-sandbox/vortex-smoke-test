# Task Plan — VRTX3-T-0023

**Task**: Endpoint `/api/healthz-smoke-680958919-b`  
**Sprint**: VRTX3-S-0004  
**Story**: VRTX3-T-0021  
**Task Type**: Implementation (backend)

---

## Overview

Implement a single independent health check endpoint that returns a minimal JSON response. This endpoint demonstrates the self-contained, parallel development pattern — no shared code, no auth, no database.

**Expected Duration**: 10–20 minutes  
**Deliverables**:

- `routes/api/healthz-smoke-680958919-b.ts` — endpoint handler
- `routes/api/healthz-smoke-680958919-b.test.ts` — integration tests

---

## Description

### What

Add GET endpoint `/api/healthz-smoke-680958919-b` that returns HTTP 200 with JSON body `{"ok":true,"variant":"680958919"}`.

### Why

Enable smoke testing of the API. Each endpoint is independent so three builders can work in parallel without merge conflicts or code sharing overhead. This sprint demonstrates that pattern at scale.

### Who

Any engineer. No coordination needed with builders of endpoints A and C.

### How

1. Create endpoint file `routes/api/healthz-smoke-680958919-b.ts` using H3Event handler pattern
2. Create test file `routes/api/healthz-smoke-680958919-b.test.ts` with two test cases:
   - Response body matches spec
   - Response time < 100ms
3. Run `bun run test -- healthz-smoke-680958919-b.test.ts` locally to verify
4. Run `bun run verify` to ensure no regressions
5. Commit with clear message including task key

---

## Acceptance Criteria (Definition of Done)

### Code Quality

- [ ] Endpoint file created: `routes/api/healthz-smoke-680958919-b.ts`
- [ ] Test file created: `routes/api/healthz-smoke-680958919-b.test.ts`
- [ ] No TypeScript errors: `bun run typecheck` passes
- [ ] No lint errors: `bun run lint` passes
- [ ] All tests pass: `bun run test -- healthz-smoke-680958919-b.test.ts` passes

### Functional Correctness

- [ ] GET request to `/api/healthz-smoke-680958919-b` returns HTTP 200
- [ ] Response body is exactly `{"ok":true,"variant":"680958919"}` (JSON, no extra fields)
- [ ] Response time is consistently < 100ms
- [ ] No auth middleware applied (handler is public)
- [ ] No database access (handler has no db imports)

### Testing

- [ ] Test uses real `H3Event` constructor (not mocked)
- [ ] Test covers both response body and response time
- [ ] Test assertions match spec exactly
- [ ] Test can run independently: `bun run test -- healthz-smoke-680958919-b.test.ts`

### Integration

- [ ] No merge conflicts with other endpoints (each file is independent)
- [ ] CI passes locally: `bun run verify` (lint + typecheck + test)
- [ ] Commit includes task key and clear message

---

## Implementation Checklist

### Step 1: Create Endpoint File

**File**: `routes/api/healthz-smoke-680958919-b.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "680958919",
  };
});
```

**Why this pattern**:

- `defineHandler` is Nitro's standard H3 handler export
- No imports beyond what's needed
- Returns plain JavaScript object (Nitro auto-serializes to JSON)
- No middleware, auth, or database access

### Step 2: Create Test File

**File**: `routes/api/healthz-smoke-680958919-b.test.ts`

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzB from "./healthz-smoke-680958919-b";

describe("GET /api/healthz-smoke-680958919-b", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-680958919-b"));

    const result = await healthzB(event);

    expect(result).toEqual({ ok: true, variant: "680958919" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-680958919-b"));

    const start = Date.now();
    await healthzB(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Why this pattern**:

- Real `H3Event` constructor (not mocked), matches Nitro testing patterns
- Two test cases: response body + response time
- Assertions match spec exactly
- Mirrors prior sprint test files (SPRINT-0019, etc.)

### Step 3: Verify Locally

```bash
# Test this endpoint only
bun run test -- healthz-smoke-680958919-b.test.ts

# Full verification (lint + typecheck + test all files)
bun run verify

# Check no regressions
bun run build
```

### Step 4: Commit

```bash
git add routes/api/healthz-smoke-680958919-b.ts routes/api/healthz-smoke-680958919-b.test.ts
git commit -m "VRTX3-T-0023: Add endpoint /api/healthz-smoke-680958919-b"
```

---

## File Ownership Map

| File                                           | Owner        | Responsibility               |
| ---------------------------------------------- | ------------ | ---------------------------- |
| `routes/api/healthz-smoke-680958919-b.ts`      | VRTX3-T-0023 | Endpoint handler (10 lines)  |
| `routes/api/healthz-smoke-680958919-b.test.ts` | VRTX3-T-0023 | Integration tests (25 lines) |

**No other files modified** — this task is completely isolated.

---

## Gotchas & Tips

### Import Path

```typescript
// ✅ Correct
import healthzB from "./healthz-smoke-680958919-b";

// ❌ Wrong (would break TypeScript)
import healthzB from "./healthz-smoke-680958919-b.ts";
```

The `.ts` extension is omitted in imports. Nitro/TypeScript handles it automatically.

### H3Event Constructor

```typescript
// ✅ Correct: matches prior test files
const event = new H3Event(new Request("http://localhost/api/healthz-smoke-680958919-b"));

// ❌ Wrong: H3Event doesn't take a string directly
const event = new H3Event("http://localhost/api/healthz-smoke-680958919-b");
```

Pass a real `Request` object to the `H3Event` constructor.

### Response Body Assertion

```typescript
// ✅ Correct: exact match
expect(result).toEqual({ ok: true, variant: "680958919" });

// ❌ Wrong: allows extra fields or string variant
expect(result).toHaveProperty("ok", true);
expect(result).toHaveProperty("variant");
```

Use `toEqual` to ensure no extra fields and exact type matching.

### Date.now() Timing

```typescript
// ⚠️ Be aware
const start = Date.now();
await healthzB(event);
const elapsed = Date.now() - start;

// This is intentional: Date.now() returns milliseconds, so we test < 100ms
// If CI box is slow and handler takes 99ms, this still passes
expect(elapsed).toBeLessThan(100);
```

100ms is a generous baseline for a handler with no I/O. If this test fails, something is very wrong.

---

## Reference

**Prior Sprint Examples**:

- SPRINT-0019: `/api/healthz-smoke-302960562-b` (same pattern, different variant)
- SPRINT-0007: `/healthz-smoke-cancel-569985850` (earlier example)

See `AGENT.md` "Adding Tests" section for copy-paste example files.

---

## Questions & Support

If you hit issues:

1. Check `AGENT.md` conventions section
2. Compare your files to `routes/api/healthz-smoke-302960562-b.ts` + `*.test.ts` (working example)
3. Run `bun run lint` and `bun run typecheck` to catch issues early
4. Message @product if blocked

---

## Success Criteria Summary

| Criterion                    | How to Verify                                                         |
| ---------------------------- | --------------------------------------------------------------------- |
| Endpoint exists and responds | `curl http://localhost:5000/api/healthz-smoke-680958919-b` (dev mode) |
| Response body correct        | Test assertion: `toEqual({ ok: true, variant: "680958919" })`         |
| Response time < 100ms        | Test assertion: `toBeLessThan(100)`                                   |
| TypeScript clean             | `bun run typecheck` (no errors)                                       |
| Lint clean                   | `bun run lint` (no errors)                                            |
| Tests pass                   | `bun run test` (includes this file)                                   |
| CI passes                    | GitHub Actions workflow (lint + typecheck + test + build)             |

✅ **DONE** when all criteria are green and code is committed.
