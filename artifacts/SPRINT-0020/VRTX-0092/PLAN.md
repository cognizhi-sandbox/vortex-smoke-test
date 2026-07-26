# VRTX-0092 Fix Plan: /api/healthz-smoke-bugfix3-458270372

## Root Cause

The Nitro route handler file `routes/api/healthz-smoke-bugfix3-458270372.ts` does not exist.

## Solution

Create the missing route handler and its test.

### Step 1: Create Handler

**File:** `routes/api/healthz-smoke-bugfix3-458270372.ts`

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "458270372",
  };
});
```

### Step 2: Create Test

**File:** `routes/api/healthz-smoke-bugfix3-458270372.test.ts`

- Imports: H3Event from nitro/h3, describe/expect/it from vitest, handler
- Test Case 1: "returns HTTP 200 with correct response body"
  - Create H3Event with request to the endpoint
  - Call handler
  - Assert result equals `{ok:true,variant:"458270372"}`
- Test Case 2: "responds in under 100ms"
  - Create H3Event
  - Measure execution time
  - Assert time < 100ms

## Verification

- Run `bun run test` — both tests must pass
- Run `curl http://localhost:5000/api/healthz-smoke-bugfix3-458270372` — should return `{"ok":true,"variant":"458270372"}`
