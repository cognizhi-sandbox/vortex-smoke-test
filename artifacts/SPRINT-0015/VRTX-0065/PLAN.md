# TASK PLAN — VRTX-0065

## Title

Implement /healthz-smoke-cancel-80899557 endpoint

## Summary

Implement a simple health check endpoint that returns `{ok:true, variant:"80899557"}` with no dependencies, auth, or database access. Update root docs with changelog entries per project convention.

## Parent Ticket

VRTX-0064 (Sprint Planning — SPRINT-0015)

## Scope

### Files Created

1. `routes/api/healthz-smoke-cancel-80899557.ts` — endpoint handler (≤10 lines)
2. `routes/api/healthz-smoke-cancel-80899557.test.ts` — test suite (≥30 lines, ≥2 test cases)

### Files Updated

1. `PRODUCT.md` — add changelog entry (1–2 lines under `## Changelog`)
2. `ARCHITECTURE.md` — add changelog entry (1–2 lines under `## Changelog`)
3. `DESIGN.md` — add changelog entry (1–2 lines under `## Changelog`)
4. `AGENT.md` — add changelog entry (1–2 lines under `## Changelog`)

## Definition of Done

**Endpoint Implementation**:

- [ ] `routes/api/healthz-smoke-cancel-80899557.ts` created following Nitro `defineHandler` pattern
- [ ] Returns `{ok:true, variant:"80899557"}` for all GET requests
- [ ] No middleware or database dependencies
- [ ] No auth checks

**Testing**:

- [ ] `routes/api/healthz-smoke-cancel-80899557.test.ts` created with Vitest + H3Event pattern
- [ ] Test 1: Response body equals `{ok:true, variant:"80899557"}`
- [ ] Test 2: Response time < 100ms
- [ ] All new tests pass: `bun run test --reporter=verbose`

**Code Quality**:

- [ ] Lint passes: `bun run lint` (zero warnings)
- [ ] TypeScript passes: `bun run typecheck`
- [ ] Build succeeds: `bun run build` (dist/ and .output/ present)

**Documentation**:

- [ ] `PRODUCT.md`: Changelog entry added under `## Changelog` section (dated 2026-07-26, SPRINT-0015)
- [ ] `ARCHITECTURE.md`: Changelog entry added under `## Changelog` section (dated 2026-07-26, SPRINT-0015)
- [ ] `DESIGN.md`: Changelog entry added under `## Changelog` section (dated 2026-07-26, SPRINT-0015)
- [ ] `AGENT.md`: Changelog entry added under `## Changelog` section (dated 2026-07-26, SPRINT-0015)

**Regression**:

- [ ] No existing tests broken: `bun run test` passes for full suite
- [ ] Existing endpoints still respond (e.g., `/api/healthz-smoke-cancel-407995880`)

## Implementation Pattern

### Endpoint Handler

Copy from `routes/api/healthz-smoke-cancel-407995880.ts`:

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "80899557",
  };
});
```

### Test Suite

Copy from `routes/api/healthz-smoke-cancel-407995880.test.ts`, update variant string and import path:

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-cancel-80899557";

describe("GET /api/healthz-smoke-cancel-80899557", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-80899557"));

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "80899557" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(new Request("http://localhost/api/healthz-smoke-cancel-80899557"));

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

### Changelog Entry Format

Add to each root doc (PRODUCT.md, ARCHITECTURE.md, DESIGN.md, AGENT.md) under the `## Changelog` section at the top (prepend to existing entries):

```markdown
### 2026-07-26 — Sprint SPRINT-0015: Health Check Endpoint

Added `/healthz-smoke-cancel-80899557` GET endpoint returning `{ok:true, variant:"80899557"}`. Self-contained, no auth/database, simple health check for smoke testing. Follows established pattern from prior sprints. See [Adding Tests](./AGENT.md#adding-tests) for test pattern.
```

## File & Module Ownership

| File                                               | Module Owner    | Responsibility                |
| -------------------------------------------------- | --------------- | ----------------------------- |
| `routes/api/healthz-smoke-cancel-80899557.ts`      | Backend/Routing | Endpoint handler logic        |
| `routes/api/healthz-smoke-cancel-80899557.test.ts` | Backend/Testing | Handler test coverage         |
| `PRODUCT.md`                                       | Product Docs    | Update product changelog      |
| `ARCHITECTURE.md`                                  | Tech Docs       | Update architecture changelog |
| `DESIGN.md`                                        | Design Docs     | Update design changelog       |
| `AGENT.md`                                         | Agent Guide     | Update agent guide changelog  |

## Success Criteria (as acceptance_criteria in FSM)

- Endpoint GET /api/healthz-smoke-cancel-80899557 returns {ok:true, variant:"80899557"} with HTTP 200
- Test file written with ≥2 test cases (response shape, performance) and all pass
- Lint passes: `bun run lint` succeeds with zero warnings
- TypeScript check passes: `bun run typecheck` succeeds
- Build succeeds: `bun run build` produces valid dist/ and .output/ directories
- Root docs updated with dated changelog entries (PRODUCT.md, ARCHITECTURE.md, DESIGN.md, AGENT.md)
- No regressions: existing tests pass, existing endpoints still work

## Testing Strategy

### Local Testing

```bash
# Run only the new test
bun run test -- routes/api/healthz-smoke-cancel-80899557.test.ts

# Run all tests
bun run test

# Verify lint and typecheck
bun run lint
bun run typecheck

# Verify build
bun run build
```

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) will automatically:

1. Lint check
2. TypeScript check
3. Run all tests
4. Build project

Expected: all pass in < 5 minutes.

## Risks & Mitigations

| Risk                                  | Mitigation                                                    |
| ------------------------------------- | ------------------------------------------------------------- |
| Lint/Prettier formatting issues       | Run `bun run lint --fix` to auto-format before commit         |
| Import path typos                     | Copy import from existing healthz endpoint                    |
| Variant string typo ("80899557")      | Double-check variant in both handler and test matches exactly |
| Forgotten changelog entries           | Update all 4 docs (PRODUCT, ARCHITECTURE, DESIGN, AGENT)      |
| Test flakiness (time-based assertion) | Use 100ms threshold as in existing tests; runs fast locally   |
| Build/CI failure                      | Verify `bun run verify` passes before pushing                 |

## Related Patterns

**Similar completed work**:

- SPRINT-0004: `/healthz-smoke-cancel-407995880` (reference implementation)
- SPRINT-0005: `/healthz-smoke-cancel-158110053`
- SPRINT-0007: `/healthz-smoke-cancel-569985850`

Copy handler and test structure from any of these.

## Effort Estimate

- Endpoint handler: 5 min (copy + edit)
- Test suite: 10 min (copy + edit)
- Changelog updates: 5 min (4 files, 1–2 lines each)
- Local verification: 5 min (lint, typecheck, test, build)
- **Total**: ~25 min including verification

---

**Ticket**: VRTX-0065  
**Sprint**: SPRINT-0015  
**Status**: Ready for Implementation  
**Created**: 2026-07-26
