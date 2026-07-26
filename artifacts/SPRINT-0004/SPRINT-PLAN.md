# SPRINT-0004 Plan — /healthz-smoke-cancel-407995880 Endpoint

**Sprint Goal**: Add a simple, self-contained GET endpoint for health checks with variant tracking.

**Idea**: VST-0004 — [smoke-cancel-178504965342788] /healthz-smoke-cancel-407995880 endpoint

---

## Summary

This sprint adds a single HTTP GET endpoint to the running service that returns a tiny JSON object with an `ok` field set to `true` and a `variant` field set to the string `"407995880"`. The endpoint is self-contained with no dependencies, no auth, no database access, and no side effects.

### Acceptance Criteria

- ✅ GET `/api/healthz-smoke-cancel-407995880` returns HTTP 200
- ✅ Response body is `{ok:true, variant:"407995880"}`
- ✅ Endpoint is tested with unit/integration tests
- ✅ Tests verify response shape and HTTP status
- ✅ CI passes: lint, typecheck, test, build

### Out of Scope

- Authentication
- Database access
- Complex business logic
- Deployment/infrastructure changes

---

## Decomposition

### 1 Epic: Add /healthz-smoke-cancel-407995880 Endpoint

Single, additive feature with one clear implementation task.

#### Story 1: Implement Endpoint & Tests (VRTX-0023)

Self-contained task: write the endpoint handler and its test suite.

---

## Phases

### Phase 1: Planning ✓ (THIS TICKET)

- [x] Investigate codebase patterns (file-based routing, endpoint structure, test conventions)
- [x] Fetch idea spec and understand requirements
- [x] Identify decomposition strategy (1 EPIC → 1 STORY → 1 TASK)
- [x] Write sprint plan
- [x] Update root docs (PRODUCT.md, ARCHITECTURE.md, DESIGN.md, AGENT.md)
- [x] Create tickets with acceptance criteria
- [x] Run checklist

**Deliverables**: SPRINT-PLAN.md (this file), updated root docs, FSM tickets created

---

### Phase 2: Implementation (VRTX-0023)

**Task**: Implement `/healthz-smoke-cancel-407995880` endpoint

**Work**:

- Create `routes/api/healthz-smoke-cancel-407995880.ts` using the Nitro `defineHandler` pattern
- Handler returns `{ok:true, variant:"407995880"}` with HTTP 200
- Create corresponding test file: `routes/api/healthz-smoke-cancel-407995880.test.ts`
- Tests verify:
  - Response body matches expected object
  - HTTP status code is 200
  - Response is fast (< 100ms, matching pattern from other healthz endpoints)

**Interface Contract**:

- **Endpoint**: `GET /api/healthz-smoke-cancel-407995880`
- **Request**: No body, no query params, no auth required
- **Response**: `{ok:true, variant:"407995880"}` (JSON)
- **Status**: 200 OK
- **Side Effects**: None

**Files**:

- `routes/api/healthz-smoke-cancel-407995880.ts` — endpoint handler
- `routes/api/healthz-smoke-cancel-407995880.test.ts` — integration test
- `artifacts/SPRINT-0004/VRTX-0023/PLAN.md` — detailed task plan

**Definition of Done**:

- Endpoint handler written and follows existing pattern (see `routes/api/healthz-smoke-126862920-a.ts`)
- Test file written with ≥2 test cases (response shape, performance)
- All tests pass: `bun run test` succeeds
- Lint passes: `bun run lint` succeeds
- TypeScript check passes: `bun run typecheck` succeeds
- Build succeeds: `bun run build` produces valid output

---

### Phase 3: Test Harness

**Scope**: Covered within Phase 2 (implementation includes testing)

- Unit tests via Vitest (`routes/**/*.test.ts`)
- API integration tests (real H3Event, handler runs with no live server)
- Pattern: Copy from `routes/api/healthz-smoke-126862920-a.test.ts`

**Test Coverage**:

- Response body shape and values
- HTTP status code (200)
- Response time (< 100ms)
- No middleware dependencies (endpoint runs standalone)

---

### Phase 4: CI

**GitHub Actions** (`.github/workflows/` — already in place):

Triggered on push to `vortex/sprint/*` and `vortex/feat/*` branches:

1. **Lint**: `bun run lint` — ESLint 9 + typescript-eslint + Prettier
   - Must pass with zero warnings
2. **TypeScript**: `bun run typecheck` — full project type check
3. **Unit/Integration Tests**: `bun run test` — Vitest on all `.test.ts` and `.test.tsx` files
   - New test file: `routes/api/healthz-smoke-cancel-407995880.test.ts`
4. **Build**: `bun run build`
   - Frontend: Vite SPA → `dist/`
   - Backend: Nitro server → `.output/server/index.mjs`
5. **E2E Smoke** (optional, if Chromium available): `bun run test:smoke`

**Expected CI Status**: All checks pass before merge.

---

## Key Decisions

| Decision                                   | Rationale                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| Single endpoint in one file                | Minimal scope — no need for subfolders or composition                      |
| Vitest + H3Event for tests                 | Matches project convention; no live server needed for integration test     |
| Returns `{ok,variant}`                     | Per spec; matches pattern of other `healthz-smoke-*` endpoints in codebase |
| No dependencies on middleware, DB, or auth | Pure, standalone handler — fast and simple to test                         |
| Lint + typecheck required before commit    | Zero-warning policy enforced by project CI                                 |

---

## Files to Create/Update

### New Files

- `routes/api/healthz-smoke-cancel-407995880.ts` (endpoint handler)
- `routes/api/healthz-smoke-cancel-407995880.test.ts` (test suite)
- `artifacts/SPRINT-0004/VRTX-0023/PLAN.md` (task plan)

### Updated Files

- `PRODUCT.md` — Changelog entry for 2026-07-26
- `ARCHITECTURE.md` — Changelog entry for 2026-07-26
- `DESIGN.md` — Changelog entry for 2026-07-26
- `AGENT.md` — Changelog entry for 2026-07-26 (if test patterns documented here)

### CI (No Changes Required)

- `.github/workflows/ci.yml` — already set up for `vortex/**` branches
- No Dockerfile/K8s changes (endpoint is purely in-memory, no deployment work)

---

## Testing Strategy

### Unit/Integration Tests (Vitest + H3Event)

Pattern (from `routes/api/healthz-smoke-126862920-a.test.ts`):

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";
import healthz from "./healthz-smoke-cancel-407995880";

describe("GET /api/healthz-smoke-cancel-407995880", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-407995880"));
    const result = await healthz(event);
    expect(result).toEqual({ ok: true, variant: "407995880" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-407995880"));
    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

### E2E/Smoke Test (Playwright, Optional)

If the smoke test spec (`e2e/smoke.spec.ts`) is extended, it could verify the endpoint:

```typescript
await page.goto("http://localhost:5000");
const response = await page.request.get("/api/healthz-smoke-cancel-407995880");
expect(response.status()).toBe(200);
const json = await response.json();
expect(json).toEqual({ ok: true, variant: "407995880" });
```

Current smoke test doesn't include this endpoint, so it's out of scope for this sprint.

---

## Success Metrics

- ✅ Endpoint is live at GET `/api/healthz-smoke-cancel-407995880`
- ✅ Response is `{ok:true, variant:"407995880"}` with HTTP 200
- ✅ Tests pass locally: `bun run test` shows new test file with 2+ passing cases
- ✅ CI passes: lint, typecheck, test, build all green
- ✅ No regressions: existing tests and endpoints still work
- ✅ Code follows project conventions (file-based routing, Vitest, H3Event pattern)

---

## Risks & Mitigations

| Risk               | Mitigation                                                             |
| ------------------ | ---------------------------------------------------------------------- |
| Lint/format issues | Run `bun run lint --fix` before commit; pre-commit hook catches errors |
| TypeScript errors  | Run `bun run typecheck` locally first                                  |
| Test failures      | Verify test runs in isolation (`bun run test --reporter=verbose`)      |
| CI timeout         | No deployment/infra changes; should be instant                         |

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0004

**Feature**: Add `/healthz-smoke-cancel-407995880` health check endpoint. Simple GET endpoint returning `{ok:true, variant:"407995880"}` with no dependencies, auth, or database access. Includes integration tests and CI validation.

**Added**:

- `routes/api/healthz-smoke-cancel-407995880.ts` — endpoint handler
- `routes/api/healthz-smoke-cancel-407995880.test.ts` — test suite (2+ cases)
- Sprint plan: `artifacts/SPRINT-0004/SPRINT-PLAN.md`

**Updated**: Root docs (PRODUCT.md, ARCHITECTURE.md, DESIGN.md, AGENT.md) with dated Changelog entries.

---

## Ticket Summary

| Ticket    | Type | Title                                              | Dependencies     | Owner    |
| --------- | ---- | -------------------------------------------------- | ---------------- | -------- |
| VRTX-0023 | TASK | Implement /healthz-smoke-cancel-407995880 endpoint | VRTX-0022 (this) | engineer |

**Total Scope**: 1 EPIC, 1 STORY, 1 TASK (or just 1 TASK if simplified).

---

## Next Steps (Post-Sprint)

1. Engineer implements VRTX-0023: writes endpoint + tests, pushes to branch
2. CI validates (lint, typecheck, test, build)
3. Ticket transitions to in_review, then done
4. Sprint branch merges into main
5. Endpoint is live in next deployment

---

**Plan written**: 2026-07-26  
**Sprint Goal**: Add health check endpoint returning `{ok:true, variant:"407995880"}`  
**Expected Duration**: < 1 hour (straightforward endpoint + test)  
**Complexity**: Low (single file, no dependencies, proven pattern in codebase)
