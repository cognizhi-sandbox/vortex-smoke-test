# Sprint Plan — VRTX3-S-0006

**Title:** Three Independent Health Check Endpoints (913793173)

**Sprint Goal:** Add three completely independent health-check endpoints to the Nitro backend without shared code, demonstrating the scalability of parallel endpoint development on the file-based routing architecture.

**Idea:** [VRTX3-I-0013](https://vortex.local/ideas/VRTX3-I-0013)

**Created:** 2026-08-05

---

## Problem & Context

Sprint owners need a lightweight way to add simple, independent HTTP API endpoints without the overhead of a full planning cycle. Currently, endpoints sit blocked waiting for decomposition and ticket creation even though they are completely isolated from each other.

## Solution

Add three completely independent GET API endpoints to `routes/api/`:

- `GET /api/healthz-smoke-913793173-a` → `{ ok: true, variant: "913793173" }`
- `GET /api/healthz-smoke-913793173-b` → `{ ok: true, variant: "913793173" }`
- `GET /api/healthz-smoke-913793173-c` → `{ ok: true, variant: "913793173" }`

**Design principle:** Each endpoint is a standalone `.ts` file with **zero shared helper code, no auth, no database dependencies**. Each is its own leaf unit of work, enabling parallel development without coordination overhead.

**Proven pattern:** This repeats the successful patterns from SPRINT-0004, SPRINT-0005, SPRINT-0007, SPRINT-0019, VRTX3-S-0002, VRTX3-S-0003, and VRTX3-S-0001. Endpoints have already been built and are working examples in the codebase.

---

## Decomposition

### Epic: VRTX3-T-0034 — Add Three Independent Health Check Endpoints (913793173)

Parent idea: VRTX3-I-0013

**Epic acceptance criteria:**

- All three endpoints implemented and accessible
- All acceptance criteria from the idea are met
- All tests pass (lint, typecheck, unit/integration, build)
- CI is green

#### Story: VRTX3-T-0035 — Health Check Endpoint `/api/healthz-smoke-913793173-a`

#### TASK: VRTX3-T-0038 — Implement `/api/healthz-smoke-913793173-a`

**Ownership:** Backend API / Nitro routing

**Description:** Add a simple GET endpoint at `/api/healthz-smoke-913793173-a` that returns a JSON response. See `artifacts/VRTX3-S-0006/VRTX3-T-0038/PLAN.md` for implementation details and test harness strategy.

**Acceptance Criteria:**

- Route file `routes/api/healthz-smoke-913793173-a.ts` exists
- Endpoint responds to GET requests with HTTP 200
- Response body is exactly `{ "ok": true, "variant": "913793173" }`
- Response `Content-Type` is `application/json`
- Response time is <100ms (no blocking I/O, no database)
- Integration test file `routes/api/healthz-smoke-913793173-a.test.ts` exists and passes
- Test covers: HTTP 200 status, correct response body, <100ms latency
- No shared dependencies with other endpoints (standalone handler, no imports from other routes)

#### Story: VRTX3-T-0036 — Health Check Endpoint `/api/healthz-smoke-913793173-b`

#### TASK: VRTX3-T-0039 — Implement `/api/healthz-smoke-913793173-b`

**Ownership:** Backend API / Nitro routing

**Description:** Add a simple GET endpoint at `/api/healthz-smoke-913793173-b` that returns a JSON response. See `artifacts/VRTX3-S-0006/VRTX3-T-0039/PLAN.md` for implementation details and test harness strategy.

**Acceptance Criteria:**

- Route file `routes/api/healthz-smoke-913793173-b.ts` exists
- Endpoint responds to GET requests with HTTP 200
- Response body is exactly `{ "ok": true, "variant": "913793173" }`
- Response `Content-Type` is `application/json`
- Response time is <100ms (no blocking I/O, no database)
- Integration test file `routes/api/healthz-smoke-913793173-b.test.ts` exists and passes
- Test covers: HTTP 200 status, correct response body, <100ms latency
- No shared dependencies with other endpoints (standalone handler, no imports from other routes)

#### Story: VRTX3-T-0037 — Health Check Endpoint `/api/healthz-smoke-913793173-c`

#### TASK: VRTX3-T-0040 — Implement `/api/healthz-smoke-913793173-c`

**Ownership:** Backend API / Nitro routing

**Description:** Add a simple GET endpoint at `/api/healthz-smoke-913793173-c` that returns a JSON response. See `artifacts/VRTX3-S-0006/VRTX3-T-0040/PLAN.md` for implementation details and test harness strategy.

**Acceptance Criteria:**

- Route file `routes/api/healthz-smoke-913793173-c.ts` exists
- Endpoint responds to GET requests with HTTP 200
- Response body is exactly `{ "ok": true, "variant": "913793173" }`
- Response `Content-Type` is `application/json`
- Response time is <100ms (no blocking I/O, no database)
- Integration test file `routes/api/healthz-smoke-913793173-c.test.ts` exists and passes
- Test covers: HTTP 200 status, correct response body, <100ms latency
- No shared dependencies with other endpoints (standalone handler, no imports from other routes)

---

## Phases

### Phase 1: EXECUTION (Dev + Verification)

**Owner:** Engineer

**Duration:** ~2 hours (each endpoint ~30 min, including testing)

**Work:**

1. Create three route files under `routes/api/`:
   - `healthz-smoke-913793173-a.ts` (basic handler)
   - `healthz-smoke-913793173-b.ts` (basic handler)
   - `healthz-smoke-913793173-c.ts` (basic handler)
2. Create three test files:
   - `healthz-smoke-913793173-a.test.ts` (H3Event integration test)
   - `healthz-smoke-913793173-b.test.ts` (H3Event integration test)
   - `healthz-smoke-913793173-c.test.ts` (H3Event integration test)
3. Each test covers: HTTP 200 response, correct JSON body, <100ms latency
4. Run `bun run verify` locally (lint, typecheck, test) — all must pass
5. Commit code with clear message (one commit per endpoint, or one for all three)

**Acceptance:**

- All three endpoints functional
- All route files under `routes/api/` follow the established pattern (no shared code)
- All test files pass independently

### Phase 2: TEST HARNESS

**Verification Steps:**

| Harness              | Command              | Expected Outcome                                            |
| -------------------- | -------------------- | ----------------------------------------------------------- |
| **Lint**             | `bun run lint`       | Zero warnings, Prettier + ESLint pass on all `.ts` files    |
| **Type Check**       | `bun run typecheck`  | No TypeScript errors in `src/` or `routes/`                 |
| **Unit/Integration** | `bun run test`       | All six test suites pass (three route tests + others)       |
| **Build**            | `bun run build`      | `dist/` and `.output/server/index.mjs` created successfully |
| **Smoke Test**       | `bun run test:smoke` | E2E smoke test passes (home page + `/api/hello` check)      |

**No changes required** — the test harness already exists and is working. All three endpoints must:

- Return HTTP 200 (verified via H3Event test)
- Return correct JSON body (verified via H3Event test assertion)
- Respond in <100ms (verified via timing assertion in test)

**Integration with existing CI:**

- GitHub Actions workflow (`.github/workflows/`) already runs `bun run verify` + `bun run test:smoke` on all `vortex/**` branches
- No new CI steps required; standard gates apply

### Phase 3: INTEGRATION & QA (Optional)

If local verification passes, endpoints are ready for:

- Integration test via `bun run dev` (manual check):

  ```bash
  curl http://localhost:5000/api/healthz-smoke-913793173-a
  curl http://localhost:5000/api/healthz-smoke-913793173-b
  curl http://localhost:5000/api/healthz-smoke-913793173-c
  ```

  Each should return `{ "ok": true, "variant": "913793173" }`

- Production build test:
  ```bash
  bun run build
  bun .output/server/index.mjs &
  curl http://localhost:3000/api/healthz-smoke-913793173-a  # etc.
  ```

**No QA sign-off required** — pattern is proven, endpoints are self-contained, scope is minimal.

---

## Test Harness Strategy

### Test File Pattern

Each endpoint gets an **integration test** using the H3Event pattern (no live server, real Nitro handler):

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";
import healthz from "./healthz-smoke-913793173-a";

describe("GET /api/healthz-smoke-913793173-a", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-913793173-a"));
    const result = await healthz(event);
    expect(result).toEqual({ ok: true, variant: "913793173" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-913793173-a"));
    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });
});
```

**Why H3Event, not a live server?**

- No setup overhead (no `bun run dev` needed)
- Tests run in parallel (faster iteration)
- Pattern already proven in SPRINT-0004, SPRINT-0005, SPRINT-0007, SPRINT-0019, etc.
- Follows `routes/api/*.test.ts` convention in `vite.config.ts` (excluded from bundle)

**Test file location & naming:**

- Colocate test with route: `routes/api/healthz-smoke-913793173-a.test.ts`
- Vitest auto-discovers (no registration needed)
- Follows existing pattern across the codebase

### Lint & Type Checking

No special configuration needed:

- ESLint + Prettier already configured in `vite.config.ts` (covers `routes/`)
- TypeScript strict mode already enabled in `tsconfig.json`
- Vitest already configured with separate `client` (jsdom) and `server` (Node) projects

### Build & Deployment

- Production build (`bun run build`) includes new endpoints automatically
- Nitro file-based routing picks up `routes/api/healthz-smoke-913793173-*.ts` on server start
- No changes needed to Nitro config, Vite config, or build pipeline
- Endpoints are read-only health checks → no risk in production

---

## Success Criteria

### Functional

- ✅ GET `/api/healthz-smoke-913793173-a` responds HTTP 200 with `{"ok":true,"variant":"913793173"}`
- ✅ GET `/api/healthz-smoke-913793173-b` responds HTTP 200 with `{"ok":true,"variant":"913793173"}`
- ✅ GET `/api/healthz-smoke-913793173-c` responds HTTP 200 with `{"ok":true,"variant":"913793173"}`
- ✅ Each endpoint responds in <100ms

### Code Quality

- ✅ `bun run lint` passes (Prettier, ESLint)
- ✅ `bun run typecheck` passes
- ✅ `bun run test` passes (all six test suites: three routes + three existing suites)
- ✅ `bun run build` succeeds

### Testing

- ✅ Each endpoint has an integration test file (`routes/api/healthz-smoke-913793173-*.test.ts`)
- ✅ Each test covers: HTTP 200, correct JSON body, <100ms latency
- ✅ All tests pass under Vitest

### Process

- ✅ Three TASK tickets created (one per endpoint)
- ✅ Each TASK has a PLAN.md describing implementation
- ✅ All TASK acceptance criteria met
- ✅ Root docs (AGENT.md, PRODUCT.md, ARCHITECTURE.md, DESIGN.md) updated with dated Changelog entries
- ✅ All code committed on ticket branch, pushed to remote
- ✅ Sprint plan checklist passes (no blockers)

---

## Risks & Mitigation

| Risk                           | Likelihood | Impact | Mitigation                                                                |
| ------------------------------ | ---------- | ------ | ------------------------------------------------------------------------- |
| Pattern mismatch with existing | Very Low   | Low    | Pattern already proven in prior sprints; copy from existing endpoints     |
| Route registration fails       | Very Low   | Low    | Nitro file-based routing is stable; no config changes needed              |
| Test harness misconfiguration  | Very Low   | Low    | H3Event pattern already works (existing tests in codebase); no new setup  |
| Response body format incorrect | Very Low   | Low    | Test assertions are strict; mismatch will fail immediately                |
| Performance SLA missed         | Very Low   | Low    | Synchronous handler with no I/O; <1ms typical; high buffer in acceptance  |
| CI failure                     | Low        | Low    | Local `bun run verify` must pass before push; CI is deterministic replica |

**Mitigation summary:** No special risks. This is a repeat of proven patterns with trivial scope. All work is additive (no modifications to existing code). Early test feedback via local `bun run verify` catches issues before CI.

---

## Dependencies

**None.** Each endpoint:

- Has no imports from other route files
- Does not modify the database
- Does not use auth middleware (available but not used)
- Does not depend on other endpoints

Endpoints can be implemented in parallel with zero coordination overhead.

---

## Out of Scope

- Authentication / authorization
- Request validation or input parameters
- Logging or metrics collection
- Response caching or CDN headers
- API documentation (OpenAPI/Swagger)
- Performance profiling beyond <100ms SLA
- Endpoint scaling or pagination

---

## Timeline

| Phase           | Duration   | Finish Date    | Owner         |
| --------------- | ---------- | -------------- | ------------- |
| Execution       | ~2 hours   | 2026-08-05     | Engineer      |
| CI Verification | ~5 min     | 2026-08-05     | CI/GitHub     |
| Integration/QA  | ~15 min    | 2026-08-05     | QA (optional) |
| **Total**       | **~2h20m** | **2026-08-05** | —             |

---

## Definitions

### Acceptance Criteria (per TASK)

Fixed interface contract:

- Route file exists at `routes/api/healthz-smoke-913793173-{a,b,c}.ts`
- GET request → HTTP 200 response
- Response body: `{ "ok": true, "variant": "913793173" }`
- Response `Content-Type: application/json`
- Response latency <100ms
- Test file at `routes/api/healthz-smoke-913793173-{a,b,c}.test.ts` passes
- `bun run verify` passes (lint, typecheck, test)

### Definition of Done (for sprint)

- All three TASK acceptance criteria met
- Epic acceptance criteria met
- All root docs updated with Changelog entry
- All artifacts committed and pushed
- Sprint plan checklist passes
- No outstanding blockers

---

## Related Documentation

- [PRODUCT.md](./PRODUCT.md) — What this project is
- [ARCHITECTURE.md](./ARCHITECTURE.md) — How it's built
- [DESIGN.md](./DESIGN.md) — Visual system and component patterns
- [AGENT.md](./AGENT.md) — Operating manual, testing conventions, adding tests
- **Idea**: [VRTX3-I-0013](https://vortex.local/ideas/VRTX3-I-0013) — Full problem/solution/acceptance criteria
- **Prior patterns**: SPRINT-0004, SPRINT-0005, SPRINT-0007, SPRINT-0019, VRTX3-S-0002, VRTX3-S-0003, VRTX3-S-0001 (all similar endpoint additions)
