# TASK VRTX-0023 — Implement /healthz-smoke-cancel-407995880 Endpoint

**Parent Ticket**: VRTX-0022 (SPRINT-0004 Plan)  
**Idea**: VST-0004 — [smoke-cancel-178504965342788] /healthz-smoke-cancel-407995880 endpoint

---

## Summary

Implement a single GET endpoint `/api/healthz-smoke-cancel-407995880` that returns `{ok:true, variant:"407995880"}` with HTTP 200. Self-contained, no auth, no database, no side effects.

## Interface Contract

**Endpoint**: `GET /api/healthz-smoke-cancel-407995880`

**Request**:

- No body
- No query parameters
- No auth required
- No middleware dependencies

**Response**:

```json
{
  "ok": true,
  "variant": "407995880"
}
```

**HTTP Status**: 200 OK  
**Content-Type**: `application/json` (inferred by Nitro)

---

## Files to Create

### 1. `routes/api/healthz-smoke-cancel-407995880.ts` (Handler)

**Purpose**: Define the GET endpoint handler

**Pattern**: Copy from `routes/api/healthz-smoke-126862920-a.ts` (simplest example)

**Template**:

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "407995880",
  };
});
```

**Notes**:

- Uses `defineHandler` from `nitro/h3`
- No middleware dependencies (no `event.context` access)
- No database access (no `db` import)
- Returns plain object (Nitro auto-serializes to JSON)
- HTTP 200 is default (no need to set status explicitly)

### 2. `routes/api/healthz-smoke-cancel-407995880.test.ts` (Test Suite)

**Purpose**: Integration tests for the endpoint

**Pattern**: Copy from `routes/api/healthz-smoke-126862920-a.test.ts`

**Template**:

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-407995880";

describe("GET /api/healthz-smoke-cancel-407995880", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/healthz-smoke-cancel-407995880")
    );

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "407995880" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/healthz-smoke-cancel-407995880")
    );

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

**Test Coverage**:

- **Test 1**: Response body shape and values (ok=true, variant="407995880")
- **Test 2**: Response latency (< 100ms)

**Notes**:

- Uses real `H3Event` constructor (no live HTTP server)
- Tests run in isolation, very fast
- Matches existing pattern in codebase
- No middleware setup needed (endpoint is standalone)

---

## Checklist

### Code Implementation

- [ ] Create `routes/api/healthz-smoke-cancel-407995880.ts` with handler
  - [ ] Returns `{ok:true, variant:"407995880"}`
  - [ ] Uses `defineHandler` from `nitro/h3`
  - [ ] No auth or database dependencies
- [ ] Create `routes/api/healthz-smoke-cancel-407995880.test.ts` with test suite
  - [ ] Test 1: Verify response body shape
  - [ ] Test 2: Verify response time < 100ms

### Validation (Local)

- [ ] Run `bun run lint` — all files formatted, no warnings
- [ ] Run `bun run typecheck` — all types check
- [ ] Run `bun run test` — new test file passes, all existing tests still pass
- [ ] Run `bun run build` — production build succeeds
- [ ] Optionally run `bun run dev` and test `/api/healthz-smoke-cancel-407995880` with curl or browser

### Git & Commit

- [ ] Stage both files: `git add routes/api/healthz-smoke-cancel-407995880.*`
- [ ] Commit with message:

  ```
  feat: add /healthz-smoke-cancel-407995880 health check endpoint

  Implement a self-contained GET endpoint returning {ok:true, variant:"407995880"}
  with HTTP 200. Includes integration tests verifying response shape and latency.

  Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
  ```

- [ ] Push to branch `vortex/feat/VRTX-0023-impl-healthz-endpoint-*`

### CI (GitHub Actions)

- [ ] Push triggers workflow on `vortex/feat/*` branch
- [ ] Workflow runs: lint → typecheck → test → build
- [ ] All checks pass (green CI)

---

## Definition of Done

✅ **Code**:

- Endpoint handler written and follows existing pattern
- Test file written with ≥2 passing test cases
- No TypeScript errors, lint warnings, or format issues

✅ **Tests**:

- `bun run test` shows new test file passing
- All existing tests still pass
- Test coverage includes response shape and latency

✅ **Build & CI**:

- `bun run verify` passes locally (lint + typecheck + test)
- `bun run build` succeeds
- GitHub Actions CI passes on the feature branch

✅ **Git**:

- Changes committed on ticket branch with clear message
- Branch pushed to remote
- Ready for merge into sprint branch

---

## Implementation Notes

### Why This Pattern?

1. **File-based routing**: Nitro automatically maps `routes/api/healthz-*.ts` → `/api/healthz-*` — no manual route registration
2. **Simple handler**: `defineHandler` + plain object return is the minimal pattern; Nitro serializes to JSON automatically
3. **H3Event test**: Tests create a real `H3Event` instance without spinning up a live server — fast, isolated, matches project convention
4. **No dependencies**: Endpoint doesn't depend on middleware, database, or context — easier to test, less surface area

### Key Decisions

| Aspect                 | Decision                            | Why                                                                                           |
| ---------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------- |
| **File name**          | `healthz-smoke-cancel-407995880.ts` | Matches naming pattern of existing `healthz-smoke-*` endpoints; "cancel" + variant ID in name |
| **Response shape**     | `{ok:true, variant:"407995880"}`    | Per spec; matches pattern of other healthz endpoints in codebase                              |
| **Test approach**      | H3Event + real handler              | Nitro pattern; no server needed; matches all existing API route tests                         |
| **Test latency check** | < 100ms                             | Consistent with other healthz tests; establishes performance baseline                         |

### What NOT to Do

❌ Don't add middleware dependencies (no `event.context` access)  
❌ Don't add database queries (no `db` import)  
❌ Don't use `sendError()` or set status explicitly (200 is default)  
❌ Don't export a named handler (use `export default`)  
❌ Don't add auth checks or request validation

---

## File Ownership Map

```
routes/api/healthz-smoke-cancel-407995880.ts
├── Handler: simple response-only GET endpoint
├── Dependencies: nitro/h3 only
└── Test: routes/api/healthz-smoke-cancel-407995880.test.ts

routes/api/healthz-smoke-cancel-407995880.test.ts
├── Integration test suite (H3Event pattern)
├── Test 1: Response shape (ok, variant)
├── Test 2: Latency (< 100ms)
└── No middleware/DB setup needed
```

---

## Success Criteria

✅ Endpoint is live at `GET /api/healthz-smoke-cancel-407995880`  
✅ Response is `{ok:true, variant:"407995880"}` with HTTP 200  
✅ Tests pass: `bun run test` includes new test file  
✅ Lint & typecheck pass  
✅ Build succeeds  
✅ No regressions: all existing tests still pass  
✅ Code follows project conventions

---

## Estimated Effort

- **Code**: ~5 minutes (copy pattern from existing healthz endpoint)
- **Testing**: ~5 minutes (copy test pattern, adjust names)
- **Validation**: ~5 minutes (run lint, typecheck, test, build)
- **Total**: ~15 minutes

---

## References

- **Similar endpoint**: `routes/api/healthz-smoke-126862920-a.ts` (simplest example)
- **Similar test**: `routes/api/healthz-smoke-126862920-a.test.ts` (exact test pattern)
- **Test guide**: [AGENT.md#Adding Tests](../../AGENT.md#adding-tests) — "An API route/middleware" row
- **Nitro H3 docs**: https://h3.unjs.io/
- **Vitest docs**: https://vitest.dev/

---

**Task Created**: 2026-07-26  
**Expected Completion**: < 1 hour  
**Complexity**: Low (straightforward, proven pattern)
