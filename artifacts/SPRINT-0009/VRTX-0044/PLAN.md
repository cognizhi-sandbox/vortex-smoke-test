# Task Plan — VRTX-0042: Implement /healthz-smoke-cancel-1023069404 Endpoint

**Sprint:** SPRINT-0009  
**Type:** TASK (Implementation)  
**Scope:** Backend API endpoint + integration tests  
**Date:** 2026-07-26

## Summary

Implement a self-contained GET `/api/healthz-smoke-cancel-1023069404` endpoint following the established pattern from SPRINT-0004, SPRINT-0005, and SPRINT-0007. No auth, no database, no side effects — responds immediately with a tiny JSON confirmation object.

## File/Module Ownership

**New Files:**

- `routes/api/healthz-smoke-cancel-1023069404.ts` — endpoint implementation
- `routes/api/healthz-smoke-cancel-1023069404.test.ts` — integration tests

**Modified Files:**

- None (endpoint is isolated, no changes to config or middleware)

## Implementation Details

### Endpoint: `routes/api/healthz-smoke-cancel-1023069404.ts`

**HTTP Method:** GET  
**Path:** `/api/healthz-smoke-cancel-1023069404`  
**Response Code:** 200 OK  
**Response Content-Type:** application/json  
**Response Body:**

```json
{
  "ok": true,
  "variant": "1023069404"
}
```

**Pattern Reference:** Copy from `routes/api/healthz-smoke-cancel-407995880.ts` and change the variant ID only.

**Implementation:**

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "1023069404",
  };
});
```

### Test Suite: `routes/api/healthz-smoke-cancel-1023069404.test.ts`

**Test Tool:** Vitest + H3Event (no live server)  
**Reference Pattern:** `routes/api/healthz-smoke-cancel-407995880.test.ts`

**Test Cases:**

1. **Response body validation** — GET returns `{ok:true, variant:"1023069404"}`
2. **HTTP status** — Response is HTTP 200
3. **Performance** — Endpoint responds in under 100ms

**Test File Implementation:**

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-1023069404";

describe("GET /api/healthz-smoke-cancel-1023069404", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-1023069404"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "1023069404" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-1023069404"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

## Acceptance Criteria

- [ ] **Implementation Complete**: `routes/api/healthz-smoke-cancel-1023069404.ts` exists and exports a default handler
- [ ] **Correct Response Shape**: Handler returns `{ok:true, variant:"1023069404"}` (no extra fields, exact variant value)
- [ ] **Test Suite Complete**: `routes/api/healthz-smoke-cancel-1023069404.test.ts` exists with tests for response body and performance
- [ ] **Lint Pass**: `bun run lint` exits 0 (ESLint 9 + Prettier, zero warnings)
- [ ] **Type Check Pass**: `bun run typecheck` exits 0 (TypeScript strict mode, full project)
- [ ] **Test Pass**: `bun run test` exits 0 (all tests including new endpoint tests pass)
- [ ] **Verify Pass**: `bun run verify` exits 0 (lint + typecheck + test together)
- [ ] **No Breaking Changes**: Existing tests continue to pass; no modifications to `middleware/`, `routes/api/*/` (except the new endpoint), or configuration files

## Test Harness

### Local Validation

Run these commands locally before pushing:

```bash
# Individual test file
bun run test routes/api/healthz-smoke-cancel-1023069404.test.ts

# Full suite
bun run verify
```

### CI/CD Gates (GitHub Actions)

On push to sprint branch, GitHub Actions (`vortex/sprint/sprint-0009-*`):

1. `bun run lint` — ESLint + Prettier
2. `bun run typecheck` — TypeScript strict
3. `bun run test` — Vitest (all test files including new endpoint test)
4. `bun run build` — Vite + Nitro production bundle

All must exit 0 before the sprint branch can merge to main.

## Edge Cases & Constraints

- **No database access** — endpoint must not import or use the db module
- **No middleware dependencies** — endpoint responds without calling middleware
- **Immutable response** — `variant` field is hardcoded to the exact string `"1023069404"`
- **Performance SLA** — must respond in under 100ms (measured via Vitest `Date.now()`)
- **No auth** — endpoint is public, requires no credentials or headers
- **No side effects** — endpoint is idempotent, read-only; calling it multiple times has no cumulative effect

## Definition of Done

✅ Endpoint file created and committed  
✅ Test file created and committed  
✅ All tests passing (unit, lint, typecheck)  
✅ CI green on sprint branch  
✅ Code review approval (if applicable)  
✅ Root docs updated with SPRINT-0009 changelog entry  
✅ Sprint plan finalized and committed

## Reference

**Similar implementations:**

- SPRINT-0004: `routes/api/healthz-smoke-cancel-407995880.ts` + test
- SPRINT-0005: `routes/api/healthz-smoke-cancel-158110053.ts` + test
- SPRINT-0007: `routes/api/healthz-smoke-cancel-569985850.ts` + test

**Codebase conventions:**

- [AGENT.md § Testing](./AGENT.md#testing) — test patterns by type
- [AGENT.md § Adding Tests](./AGENT.md#adding-tests) — how to structure new test files
- [ARCHITECTURE.md § Routing](./ARCHITECTURE.md#routing) — file-based routing, ignored paths
