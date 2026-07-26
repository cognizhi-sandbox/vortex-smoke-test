# VRTX-0005 Implementation Plan

**Title**: Implement `/healthz-smoke-136110581-b` endpoint

**Ticket**: VRTX-0005 (TASK)

**Parent**: VRTX-0003 (STORY)

**Effort**: 1 engineer-hour

---

## Problem

The service needs a lightweight health-check endpoint at `/healthz-smoke-136110581-b` to confirm readiness. No auth, no database, no shared code — just a GET endpoint returning `{ok: true, variant: "136110581"}` with HTTP 200.

## Solution

Implement a standalone Nitro route handler at `routes/api/healthz-smoke-136110581-b.ts` that:

1. Accepts GET requests to `/api/healthz-smoke-136110581-b`
2. Returns `{ok: true, variant: "136110581"}` with HTTP 200
3. Has no dependencies on middleware, database, or other endpoints

## Acceptance Criteria (Definition of Done)

- [ ] File `routes/api/healthz-smoke-136110581-b.ts` created with Nitro handler
- [ ] Handler returns `{ok: true, variant: "136110581"}` with HTTP 200
- [ ] Integration test `routes/api/healthz-smoke-136110581-b.test.ts` created and passing
- [ ] `bun run lint` passes with zero warnings
- [ ] `bun run typecheck` passes
- [ ] `bun run test` passes (all tests including new integration test)
- [ ] Code committed with clear message: "feat(SPRINT-0001): add /healthz-smoke-136110581-b endpoint"

---

## Implementation Details

### File: `routes/api/healthz-smoke-136110581-b.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler((event) => {
  return {
    ok: true,
    variant: "136110581",
  };
});
```

**Pattern**: Standalone Nitro handler using `defineHandler` + H3 (H3 automatically sets HTTP 200 for successful responses).

### File: `routes/api/healthz-smoke-136110581-b.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import handler from "./healthz-smoke-136110581-b.ts";
import { createEvent } from "h3";

describe("GET /api/healthz-smoke-136110581-b", () => {
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

**Pattern**: Vitest integration test creating a mock H3Event, calling the handler, and asserting response and status code.

---

## Testing Strategy

1. **Unit/Integration Test**: Vitest + H3Event (routes/api/healthz-smoke-136110581-b.test.ts)
   - Assert response structure matches `{ok: true, variant: "136110581"}`
   - Assert HTTP status is 200
   - Run via `bun run test`

2. **Manual Smoke Test** (after all endpoints complete):

   ```bash
   bun run dev
   curl http://localhost:5000/api/healthz-smoke-136110581-b
   # Expected: {"ok":true,"variant":"136110581"}
   ```

3. **CI Gate**: All checks pass via GitHub Actions
   - Lint: `bun run lint`
   - Typecheck: `bun run typecheck`
   - Test: `bun run test`
   - Build: `bun run build`
   - Smoke: `bun run test:smoke`

---

## File/Module Ownership Map

| Module                                         | Ownership | Dependencies              |
| ---------------------------------------------- | --------- | ------------------------- |
| `routes/api/healthz-smoke-136110581-b.ts`      | VRTX-0005 | Nitro/H3 (no custom deps) |
| `routes/api/healthz-smoke-136110581-b.test.ts` | VRTX-0005 | Vitest, H3 test utilities |

**No shared code** — this endpoint is completely standalone. No middleware, no database, no auth, no helpers. Does NOT touch or depend on any other task's code.

---

## Interface Contract

### Endpoint

```
GET /api/healthz-smoke-136110581-b
```

### Request

No query parameters, request body, or headers required.

### Response

**Success** (HTTP 200):

```json
{
  "ok": true,
  "variant": "136110581"
}
```

**Error**: None defined — this endpoint cannot fail under normal conditions (no external dependencies).

---

## Verification Checklist

- [ ] Handler file created and contains `defineHandler` returning correct JSON
- [ ] Integration test file created and imports from correct handler
- [ ] `bun run test` passes (test runs and assertions pass)
- [ ] `bun run typecheck` passes (no TypeScript errors)
- [ ] `bun run lint` passes (ESLint 9 + Prettier check)
- [ ] Manual curl test confirms HTTP 200 and JSON response
- [ ] Git commit created with message "feat(SPRINT-0001): add /healthz-smoke-136110581-b endpoint"

---

## Changelog

### 2026-07-26 — VRTX-0005 Implementation

Standalone GET endpoint at `/healthz-smoke-136110581-b` returning `{ok: true, variant: "136110581"}` with HTTP 200. No auth, no database, no shared code. Integration test via Vitest + H3Event. Passes lint, typecheck, and test gates.
