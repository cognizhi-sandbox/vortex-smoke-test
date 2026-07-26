# SPRINT-0013: Health Check Endpoint

**Sprint Goal:** Add a simple, self-contained health check endpoint to demonstrate the API route pattern and expand the smoke test coverage.

**Duration:** 2-day sprint  
**Target Date:** 2026-07-26  
**Branch:** `vortex/sprint/sprint-0013-e9613a57`

---

## Scope

### User Stories

- As a service consumer, I can GET `/healthz-smoke-cancel-537464696` and receive a small JSON response confirming the endpoint is live.

### Acceptance Criteria

- ✅ Endpoint `GET /api/healthz-smoke-cancel-537464696` returns HTTP 200
- ✅ Response body is `{ ok: true, variant: "537464696" }`
- ✅ Endpoint is self-contained: no auth, no database, no middleware dependencies
- ✅ Unit test confirms response structure and timing (<100ms)
- ✅ Root docs updated with Changelog entries
- ✅ CI passes (lint, typecheck, test, build)

### Out of Scope

- Authentication or authorization
- Database access or persistence
- Middleware integration
- Dynamic response variants

---

## Design Summary

**Pattern:** Follow the health check endpoint pattern established in SPRINT-0004, SPRINT-0005, and SPRINT-0007. Each is a minimal, self-contained GET endpoint with no side effects.

**File Structure:**

- `routes/api/healthz-smoke-cancel-537464696.ts` — handler returning `{ ok, variant }`
- `routes/api/healthz-smoke-cancel-537464696.test.ts` — integration test using real `H3Event`

**Response Format:**

```json
{
  "ok": true,
  "variant": "537464696"
}
```

**Testing Strategy:**

- Response structure verification (exact equality check)
- Performance check: endpoint must respond in <100ms
- Integration test using real `H3Event` (no live server required)

---

## Implementation Phases

### Phase 1: Implementation

**Owner:** Engineer  
**Ticket:** VRTX-0056

Create the endpoint file and integration test. Copy the pattern from `routes/api/healthz-smoke-cancel-407995880.ts` and `.test.ts`.

**Deliverables:**

- `routes/api/healthz-smoke-cancel-537464696.ts`
- `routes/api/healthz-smoke-cancel-537464696.test.ts`
- `artifacts/SPRINT-0013/VRTX-0056/PLAN.md`

**Definition of Done:**

- Endpoint file created and returns correct response
- Test file created with structure and performance assertions
- All tests pass locally (`bun run test`)
- No lint or type errors (`bun run lint && bun run typecheck`)
- Changes committed on ticket branch

---

### Phase 2: Documentation Update

**Owner:** Product  
**Ticket:** VRTX-0057

Update root docs with Changelog entries documenting the new endpoint across AGENT.md, PRODUCT.md, ARCHITECTURE.md, and DESIGN.md.

**Deliverables:**

- Updated AGENT.md with Changelog entry for SPRINT-0013
- Updated PRODUCT.md with Changelog entry for SPRINT-0013
- Updated ARCHITECTURE.md with Changelog entry for SPRINT-0013
- Updated DESIGN.md with Changelog entry for SPRINT-0013

**Definition of Done:**

- Each root doc includes dated Changelog entry under "### 2026-07-26 — Sprint SPRINT-0013"
- Changelog entries describe the new endpoint and follow the pattern of prior sprints
- All docs are committed on ticket branch

---

### Phase 3: Verification

**Owner:** QA / CI  
**Ticket:** VRTX-0058 (CI verification, not manual test)

Verify the full test harness and CI pipeline pass.

**Deliverables:**

- `bun run verify` passes (lint, typecheck, test)
- CI workflow passes on the sprint branch
- `bun run build` produces valid bundles

**Definition of Done:**

- Local verification gates pass: `bun run lint`, `bun run typecheck`, `bun run test`
- GitHub Actions CI passes on sprint branch
- Production build completes without errors
- Changes merged into sprint branch

---

## Test Harness

### Unit/Component/API Tests (Phase 1)

**Command:** `bun run test`

**Coverage:**

- `routes/api/healthz-smoke-cancel-537464696.test.ts` — 2 test cases:
  1. Response structure: expects `{ ok: true, variant: "537464696" }`
  2. Performance: endpoint responds in <100ms

**Test Environment:**

- Vitest with Node environment (real `H3Event`, no live server)
- Uses actual handler code (no mocking)

**Why This Pattern:**

- Real `H3Event` mimics production routing exactly
- No server startup overhead for API tests
- Integration-level assertions (not just unit)

### Type Check

**Command:** `bun run typecheck`

**Scope:**

- TypeScript strict mode on all routes + middleware
- Confirms `H3Event` types match handler signature

### Lint

**Command:** `bun run lint`

**Scope:**

- ESLint 9 + typescript-eslint
- Prettier formatting check
- Zero-warning policy

### Full Verification

**Command:** `bun run verify`

Runs `lint && typecheck && test` in sequence. Gate for pushing.

---

## CI/CD

### GitHub Actions Workflow

**Trigger:** Push to `vortex/sprint/sprint-0013-*` or `vortex/feat/VRTX-***` branches

**Steps:**

1. **Setup:** Checkout, install (bun)
2. **Lint:** `bun run lint`
3. **Type Check:** `bun run typecheck`
4. **Test:** `bun run test` (Vitest, all test files)
5. **Build:** `bun run build` (Vite SPA + Nitro server)
6. **Artifact:** Save `dist/` and `.output/` for deployment readiness

**Failure Criteria:**

- Any lint warnings
- Type errors
- Test failures
- Build errors

**Success Criteria:**

- All gates pass
- Artifacts available for review or deployment

**Note:** E2E tests (Playwright) not required for this sprint — smoke tests (CI only) are sufficient.

---

## Ticket Decomposition

| Ticket    | Type | Title                                                       | Phase          | Owner    | Dependencies |
| --------- | ---- | ----------------------------------------------------------- | -------------- | -------- | ------------ |
| VRTX-0056 | TASK | Implement `/healthz-smoke-cancel-537464696` endpoint + test | Implementation | Engineer | None         |
| VRTX-0057 | TASK | Update root docs with SPRINT-0013 Changelog entries         | Documentation  | Product  | VRTX-0056    |
| VRTX-0058 | TASK | Verify test harness and CI pass                             | Verification   | QA/CI    | VRTX-0057    |

---

## Definition of Done (Sprint Level)

- [ ] VRTX-0056: Endpoint implementation + test complete
- [ ] VRTX-0057: Root docs updated with Changelog
- [ ] VRTX-0058: All verification gates (lint, typecheck, test, build, CI) pass
- [ ] All commits pushed to ticket branches
- [ ] Sprint branch merged to vortex/sprint/sprint-0013-\*
- [ ] No blockers or open questions

---

## Risks & Assumptions

**Risks (Low):**

- Minimal: additive, isolated feature with no side effects
- No breaking changes to existing endpoints or middleware
- No database or auth changes

**Assumptions:**

- Bun runtime available in dev, test, and CI environments
- Existing test patterns (H3Event, Vitest) remain unchanged
- GitHub Actions workflow already in place and healthy

---

## Key Decisions

| Decision                                          | Rationale                                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Copy-paste pattern from SPRINT-0004/0005/0007** | Ensures consistency, avoids introducing new patterns, reduces risk                                        |
| **No EPIC/STORY layer**                           | Feature is too small and straightforward to warrant organizational structure; one or two TASKs sufficient |
| **Integration test via real H3Event**             | Matches production routing exactly, catches integration bugs that unit mocks would miss                   |
| **<100ms performance assertion**                  | Smoke tests require fast endpoints; health checks should never be a bottleneck                            |
| **No E2E test**                                   | Smoke test coverage sufficient; full E2E Playwright suite not needed for simple endpoint                  |

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0013: Health Check Endpoint

Added `/healthz-smoke-cancel-537464696` GET endpoint returning `{ok:true, variant:"537464696"}`. Self-contained, no auth/database. Fourth example of minimal health check pattern, expanding smoke test coverage. Updated root docs (AGENT, PRODUCT, ARCHITECTURE, DESIGN) with Changelog entries across all sprints.
