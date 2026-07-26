# Sprint Plan — SPRINT-0001

**Idea**: VST-0001 — [smoke-178504614814755] 3 independent endpoints (136110581)

**Goal**: Add three completely independent GET HTTP endpoints to the running service, each returning a JSON confirmation object with no shared code, auth, or database dependencies.

**Status**: PLANNING

---

## Problem

Sprint owners lack a lightweight way to add small, independent HTTP endpoints without full planning overhead. Three endpoints (`/healthz-smoke-136110581-a`, `/healthz-smoke-136110581-b`, `/healthz-smoke-136110581-c`) sit blocked on that ceremony today.

## Solution

Add three completely independent GET endpoints, each returning `{ok: true, variant: "136110581"}` with HTTP 200. No shared code, no auth, no database, no dependency between endpoints — each is a standalone leaf unit of work so they can be built in parallel by independent engineers.

---

## Acceptance Criteria

- [ ] GET `/healthz-smoke-136110581-a` returns `{ok: true, variant: "136110581"}` with HTTP 200
- [ ] GET `/healthz-smoke-136110581-b` returns `{ok: true, variant: "136110581"}` with HTTP 200
- [ ] GET `/healthz-smoke-136110581-c` returns `{ok: true, variant: "136110581"}` with HTTP 200
- [ ] Each endpoint is implemented as a standalone Nitro route with no shared code or middleware
- [ ] Each endpoint has an integration test verifying the response and status code
- [ ] CI passes (lint, typecheck, test) on all new code
- [ ] Existing endpoints and smoke test continue to pass unmodified
- [ ] All code committed to feature branches with meaningful commit messages

---

## Scope

### Included

- Three independent GET endpoints in `routes/api/`
- Integration test for each endpoint (`routes/api/*.test.ts`)
- No shared helpers, middleware, or code between endpoints
- CI validation (lint, typecheck, test)

### Out of Scope

- Auth, database, shared utilities, middleware
- Performance tuning or caching
- Monitoring or logging beyond standard Nitro patterns
- Frontend changes

---

## Phases

### Phase 1: Development

**Tasks** (3 parallel, no dependencies):

1. **VRTX-0002** — Implement `/healthz-smoke-136110581-a` endpoint
   - Create `routes/api/healthz-smoke-136110581-a.ts`
   - Implement handler returning `{ok: true, variant: "136110581"}` with HTTP 200
   - Add integration test `routes/api/healthz-smoke-136110581-a.test.ts`

2. **VRTX-0003** — Implement `/healthz-smoke-136110581-b` endpoint
   - Create `routes/api/healthz-smoke-136110581-b.ts`
   - Implement handler returning `{ok: true, variant: "136110581"}` with HTTP 200
   - Add integration test `routes/api/healthz-smoke-136110581-b.test.ts`

3. **VRTX-0004** — Implement `/healthz-smoke-136110581-c` endpoint
   - Create `routes/api/healthz-smoke-136110581-c.ts`
   - Implement handler returning `{ok: true, variant: "136110581"}` with HTTP 200
   - Add integration test `routes/api/healthz-smoke-136110581-c.test.ts`

### Phase 2: Testing & Validation

**Barrier**: All development tasks complete before validation begins.

- Run `bun run verify` (lint, typecheck, test)
- Run `bun run test:smoke` to confirm existing endpoints pass
- Manually curl each endpoint to confirm response
- All three endpoints respond 200 with expected JSON

### Phase 3: CI/CD

- GitHub Actions workflow runs on feature branch (lint, typecheck, test, build all pass)
- No special deployment — endpoints live on dev and staging post-merge

---

## Test Harness

### Unit/Integration Tests

Each endpoint gets an integration test using Vitest + H3Event:

**Pattern** (see `routes/api/hello.test.ts` as reference):

```typescript
import { describe, it, expect } from "vitest";
import handler from "./healthz-smoke-136110581-<X>.ts";
import { createEvent } from "h3";

describe("GET /api/healthz-smoke-136110581-<X>", () => {
  it("returns {ok: true, variant: '136110581'} with HTTP 200", async () => {
    const event = createEvent({
      method: "GET",
      node: { req: {}, res: {} },
    });
    const result = await handler(event);
    expect(result).toEqual({ ok: true, variant: "136110581" });
    expect(event.node.res.statusCode).toEqual(200);
  });
});
```

### Smoke Test

Existing smoke test (`e2e/smoke.spec.ts`) verifies that the main app still loads and responds.

---

## CI/CD

### GitHub Actions Workflow

Runs on any push to `vortex/**` branches (configured in `.github/workflows/`):

1. **Lint** — ESLint 9 + Prettier check
2. **Typecheck** — `tsc --build`
3. **Test** — `bun run test` (Vitest on all `*.test.ts` and `*.test.tsx`)
4. **Build** — `bun run build` (Vite SPA + Nitro server)
5. **Smoke** — `bun run test:smoke` (Playwright home page load)

All steps must pass before merge. CI is green when all 5 steps complete successfully.

---

## Files Changed

```
routes/api/
  ├── healthz-smoke-136110581-a.ts
  ├── healthz-smoke-136110581-a.test.ts
  ├── healthz-smoke-136110581-b.ts
  ├── healthz-smoke-136110581-b.test.ts
  ├── healthz-smoke-136110581-c.ts
  └── healthz-smoke-136110581-c.test.ts

artifacts/SPRINT-0001/
  ├── SPRINT-PLAN.md (this file)
  ├── VRTX-0002/PLAN.md
  ├── VRTX-0003/PLAN.md
  └── VRTX-0004/PLAN.md
```

---

## Timeline & Effort

- **Development**: ~1 engineer-hour per endpoint (~3 hours total, parallel on 3 engineers = 1 hour wall-clock)
- **Testing & Validation**: ~30 minutes (parallel, ~15 min wall-clock)
- **CI/CD**: Automated (~2 minutes)
- **Total wall-clock**: ~1.5–2 hours on a 3-person team

---

## Dependencies & Blockers

- **No external dependencies** — each task is independent, no shared code or databases
- **No API contracts** — endpoints are purely additive, no existing endpoints modified
- **No database schema changes** — SQLite schema unchanged
- **Existing code path unaffected** — no middleware changes, no routing conflicts

---

## Success Criteria

✅ Three endpoints respond 200 with `{ok: true, variant: "136110581"}` each  
✅ All tests pass (unit, integration, smoke)  
✅ Lint and typecheck pass with zero warnings  
✅ CI green on feature branch  
✅ Existing endpoints continue to work (home page, `/api/hello`, `/api/users`)

---

## Changelog

### 2026-07-26 — SPRINT-0001 Planning

Sprint plan created for [smoke-178504614814755] 3 independent endpoints (136110581). Goal: add three independent GET endpoints returning `{ok: true, variant: "136110581"}` each. Structure: 1 EPIC (VRTX-0001A) with 3 independent TASKs (VRTX-0002, VRTX-0003, VRTX-0004), each implementing one endpoint with integration test. Test harness: Vitest + H3Event integration tests per endpoint, existing smoke test confirms home page. CI: GitHub Actions (lint, typecheck, test, build, smoke). Parallelizable — no dependencies between endpoints.
