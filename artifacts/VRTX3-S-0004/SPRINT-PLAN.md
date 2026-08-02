# Sprint Plan — VRTX3-S-0004

**Sprint Goal**: Add three independent health check endpoints for smoke testing (680958919 variant)

**Sprint ID**: VRTX3-S-0004  
**Idea**: VRTX3-I-0004  
**Planning Ticket**: VRTX3-T-0019

---

## Overview

This sprint delivers three independent HTTP GET endpoints (`/api/healthz-smoke-680958919-a`, `/api/healthz-smoke-680958919-b`, `/api/healthz-smoke-680958919-c`), each returning a minimal JSON health check response. No shared code, no auth, no database — each endpoint is a completely standalone unit of work, demonstrating the pattern established in prior sprints (SPRINT-0019, SPRINT-0004, SPRINT-0005, SPRINT-0007).

**Key Insight**: By eliminating code sharing between endpoints, we unblock three parallel work streams — builders can work independently without merge conflicts or coordination overhead.

---

## Scope

### In Scope

- Three independent GET endpoints under `routes/api/healthz-smoke-680958919-*.ts`
- Each returns HTTP 200 with JSON body `{"ok":true,"variant":"680958919"}`
- Each endpoint has its own integration test file (`routes/api/healthz-smoke-680958919-*.test.ts`)
- All endpoints respond within 100ms (no I/O, auth, or database)
- Type check, lint, and full test suite pass
- CI green on `vortex/sprint/vrtx3-s-0004-*` branch

### Out of Scope

- Middleware changes (no auth, auth stub is unchanged)
- Database schema changes (no persistence)
- API documentation beyond test coverage
- Frontend changes (backend-only sprint)
- Performance optimization beyond 100ms baseline
- Error handling beyond HTTP 200 success path

---

## Phases

### Phase 1: Development (Parallel Tasks)

**Duration**: ~30–60 minutes per task × 3 parallel streams = ~30–60 minutes wall-clock  
**Deliverables**: Three endpoint files + three test files, all committed

Three independent tasks run in parallel with zero dependencies:

- **VRTX3-T-0020**: Endpoint A (`/api/healthz-smoke-680958919-a`)
- **VRTX3-T-0021**: Endpoint B (`/api/healthz-smoke-680958919-b`)
- **VRTX3-T-0022**: Endpoint C (`/api/healthz-smoke-680958919-c`)

Each task:

1. Create endpoint file (`routes/api/healthz-smoke-680958919-{a,b,c}.ts`) following H3Event handler pattern
2. Create test file (`routes/api/healthz-smoke-680958919-{a,b,c}.test.ts`) using real H3Event
3. Verify response body matches spec: `{"ok":true,"variant":"680958919"}`
4. Verify response time < 100ms
5. Commit changes on dedicated task branch

**File/Module Ownership**:

- VRTX3-T-0020 owns `routes/api/healthz-smoke-680958919-a.ts` + `routes/api/healthz-smoke-680958919-a.test.ts`
- VRTX3-T-0021 owns `routes/api/healthz-smoke-680958919-b.ts` + `routes/api/healthz-smoke-680958919-b.test.ts`
- VRTX3-T-0022 owns `routes/api/healthz-smoke-680958919-c.ts` + `routes/api/healthz-smoke-680958919-c.test.ts`

### Phase 2: Local Verification

**Duration**: ~5–10 minutes  
**Deliverables**: All three tasks merged, full test suite passing locally

After all three endpoint tasks merge:

1. Run `bun run test` — all three new tests pass
2. Run `bun run typecheck` — no errors
3. Run `bun run lint` — no errors
4. Run `bun run verify` — full gates pass (lint + typecheck + test)

### Phase 3: CI Validation

**Duration**: ~5–10 minutes (automated)  
**Deliverables**: GitHub Actions workflow passes on `vortex/sprint/vrtx3-s-0004-*` branch

CI runs on each commit:

1. `npm ci` / `bun install` (or cached from previous run)
2. `bun run lint` — ESLint 9 + typescript-eslint pass
3. `bun run typecheck` — TypeScript strict mode pass
4. `bun run test` — Vitest (all unit + component + API integration tests pass)
5. `bun run build` — Vite + Nitro prod build succeeds (outputs `dist/` + `.output/server/index.mjs`)

**CI does NOT run E2E tests** — those are manual or scheduled. See `.github/workflows/` config for branch triggers.

### Phase 4: Smoke Test Validation (Manual, if desired)

**Duration**: ~5 minutes  
**Command**: `bun run test:smoke`

Verifies the running dev server returns valid responses for all three new endpoints (not required for sprint completion, but recommended pre-ship).

---

## Acceptance Criteria

### Sprint Level

- ✅ Three endpoint files created: `routes/api/healthz-smoke-680958919-a.ts`, `routes/api/healthz-smoke-680958919-b.ts`, `routes/api/healthz-smoke-680958919-c.ts`
- ✅ Each endpoint returns HTTP 200 with JSON body `{"ok":true,"variant":"680958919"}`
- ✅ Each endpoint has matching integration test file (`*.test.ts`)
- ✅ All tests pass: `bun run test` (Vitest)
- ✅ Type check passes: `bun run typecheck`
- ✅ Lint passes: `bun run lint`
- ✅ Full verify gate passes: `bun run verify` (lint + typecheck + test)
- ✅ CI passes on `vortex/sprint/vrtx3-s-0004-*` branch (GitHub Actions: lint, typecheck, test, build)
- ✅ No E2E regressions (smoke test should pass if run)

### Per-Task Level (VRTX3-T-0020, VRTX3-T-0021, VRTX3-T-0022)

Each task:

- ✅ Endpoint file follows H3Event pattern: `defineHandler(() => ({ ok: true, variant: "680958919" }))`
- ✅ Test file uses real H3Event constructor, tests response body and response time
- ✅ No shared code between endpoints (each file is self-contained)
- ✅ Response time < 100ms
- ✅ Commits are clean, message includes task key and endpoint variant

---

## Implementation Strategy

### Pattern (Copy from Prior Sprints)

**Endpoint File** (`routes/api/healthz-smoke-680958919-a.ts`):

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "680958919",
  };
});
```

**Test File** (`routes/api/healthz-smoke-680958919-a.test.ts`):

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthzA from "./healthz-smoke-680958919-a";

describe("GET /api/healthz-smoke-680958919-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-680958919-a"));
    const result = await healthzA(event);
    expect(result).toEqual({ ok: true, variant: "680958919" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-680958919-a"));
    const start = Date.now();
    await healthzA(event);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

Repeat for `-b` and `-c` endpoints (change import name and variant string in describe block).

### Code Review Checklist (Per-Task)

- [ ] File naming consistent: `healthz-smoke-680958919-{a,b,c}.ts` + `*.test.ts`
- [ ] Response body matches spec exactly: `{"ok":true,"variant":"680958919"}`
- [ ] No imports beyond `defineHandler` (no auth, db, middleware)
- [ ] Test file uses real `H3Event`, not mocked
- [ ] Response time assertion present and < 100ms
- [ ] No TypeScript errors (`bun run typecheck`)
- [ ] No lint errors (`bun run lint`)
- [ ] Test passes locally (`bun run test -- <filename>.test.ts`)

---

## Risks & Mitigations

| Risk                             | Impact   | Mitigation                                                     |
| -------------------------------- | -------- | -------------------------------------------------------------- |
| TypeScript import path issue     | High     | Copy exact import syntax from prior endpoint test files        |
| H3Event constructor signature    | Medium   | Verify against `routes/api/healthz-smoke-302960562-a.test.ts`  |
| Response time > 100ms (unlikely) | Low      | Simple handler; timing only a concern if CI box is very slow   |
| Merge conflict between 3 tasks   | Very Low | Each task owns separate files; no overlap                      |
| CI timeout                       | Low      | Timeout usually 10+ min; our test suite runs in ~30–60 seconds |

---

## Deliverables Checklist

### Commit Artifacts

- [x] `artifacts/VRTX3-S-0004/SPRINT-PLAN.md` (this file)
- [x] `artifacts/VRTX3-S-0004/VRTX3-T-0020/PLAN.md` (endpoint A plan)
- [x] `artifacts/VRTX3-S-0004/VRTX3-T-0021/PLAN.md` (endpoint B plan)
- [x] `artifacts/VRTX3-S-0004/VRTX3-T-0022/PLAN.md` (endpoint C plan)

### Code Changes (Per-Task Commits)

- [ ] `routes/api/healthz-smoke-680958919-a.ts` + `*.test.ts`
- [ ] `routes/api/healthz-smoke-680958919-b.ts` + `*.test.ts`
- [ ] `routes/api/healthz-smoke-680958919-c.ts` + `*.test.ts`

### Root Docs (Updated)

- [x] `AGENT.md` — Changelog entry added
- [x] `PRODUCT.md` — Changelog entry added
- [x] `ARCHITECTURE.md` — Changelog entry added
- [x] `DESIGN.md` — Changelog entry added (no design changes, backend-only sprint)

---

## Ticket Decomposition

| Ticket       | Title                                     | Type | Depends On | Sprint |
| ------------ | ----------------------------------------- | ---- | ---------- | ------ |
| VRTX3-T-0019 | Sprint plan — VRTX3-S-0004                | PLAN | N/A        | N/A    |
| VRTX3-T-0020 | Endpoint `/api/healthz-smoke-680958919-a` | TASK | N/A        | S-0004 |
| VRTX3-T-0021 | Endpoint `/api/healthz-smoke-680958919-b` | TASK | N/A        | S-0004 |
| VRTX3-T-0022 | Endpoint `/api/healthz-smoke-680958919-c` | TASK | N/A        | S-0004 |

**No interdependencies** — all three endpoint tasks can start immediately after planning is complete.

---

## Success Metrics

✅ **Primary Metric**: All acceptance criteria met (3 endpoints, 3 tests, CI green)  
✅ **Quality Metric**: Zero lint/type/test errors  
✅ **Delivery Metric**: All tasks complete, merged, and committed by deadline  
✅ **Demonstrative Metric**: Parallel work streams (3 tasks) finish concurrently with no serialization bottleneck

---

## Author & Timeline

**Planning Ticket**: VRTX3-T-0019 (this document)  
**Planning Date**: 2026-08-02  
**Expected Execution**: ~1–2 hours wall-clock (3 tasks in parallel + CI validation)  
**Author**: Product (Claude agent)

---

## Appendix: Running the Sprint

### Local Development

```bash
# After all three endpoint tasks are merged to the sprint branch:
bun run verify                 # lint + typecheck + test (all gates)
bun run build                  # prod build
bun run dev                    # dev server (http://localhost:5000)
curl http://localhost:5000/api/healthz-smoke-680958919-a  # test endpoint A
```

### CI Monitoring

Monitor `.github/workflows/` runs on `vortex/sprint/vrtx3-s-0004-*` branch — if any step fails, check logs and fix before merging to `dev`.

### Pre-Ship Checklist

- [ ] All three endpoint files created and committed
- [ ] `bun run verify` passes locally (lint + typecheck + test)
- [ ] GitHub Actions passes (CI logs green)
- [ ] At least one manual curl test of each endpoint (optional but recommended)
- [ ] Changelog entries added to AGENT.md, PRODUCT.md, ARCHITECTURE.md, DESIGN.md
- [ ] Sprint branch merged to dev
