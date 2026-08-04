# PLAN: VRTX3-T-0029 – Fix /api/healthz-smoke-bugfix3-331988924 returning 404

## Root Cause Analysis

**Defect:** `GET /api/healthz-smoke-bugfix3-331988924` returns HTTP 404 instead of HTTP 200 with `{"ok":true,"variant":"331988924"}`.

**RCA:** The route handler file `/routes/api/healthz-smoke-bugfix3-331988924.ts` does not exist. Nitro's file-based routing cannot resolve the request.

**Verification:** Confirmed via file system check and routing convention (see `CLAUDE.md`):

- Route files live under `routes/api/`
- File naming pattern: `routes/api/<name>.ts` → `GET /api/<name>`
- Missing file means the route is not registered

## Fix Plan

Create two files following the established pattern in `routes/api/healthz-smoke-302960562-a.ts` and its test:

### 1. Implementation: `routes/api/healthz-smoke-bugfix3-331988924.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "331988924",
  };
});
```

### 2. Test: `routes/api/healthz-smoke-bugfix3-331988924.test.ts`

- Copy pattern from `routes/api/healthz-smoke-302960562-a.test.ts`
- Verify handler returns `{ ok: true, variant: "331988924" }`
- Verify response time < 100ms
- H3Event integration test (no live server required)

## Acceptance Criteria

- ✅ `routes/api/healthz-smoke-bugfix3-331988924.ts` created with correct variant ID
- ✅ `routes/api/healthz-smoke-bugfix3-331988924.test.ts` created with 2+ assertions
- ✅ `bun run test` passes both unit tests
- ✅ `bun run verify` (lint, typecheck, test) passes
- ✅ GET /api/healthz-smoke-bugfix3-331988924 returns 200 with correct JSON

## No Dependencies

This endpoint is self-contained, has no shared code, no auth, no database. No interdependencies with other fixes in this sprint.
