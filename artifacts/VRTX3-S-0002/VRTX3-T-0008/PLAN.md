# VRTX3-T-0008 Fix Plan

**Defect:** GET /api/healthz-smoke-bugfix2-524723214 returns 404, should return 200 with `{ok:true,variant:"524723214"}`

**Root Cause:** Route handler file `routes/api/healthz-smoke-bugfix2-524723214.ts` does not exist.

---

## Implementation

### 1. Create Route Handler

File: `routes/api/healthz-smoke-bugfix2-524723214.ts`

Pattern: Self-contained Nitro route handler (no auth, no database, no shared code)

```typescript
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "524723214",
  };
});
```

### 2. Create Integration Test

File: `routes/api/healthz-smoke-bugfix2-524723214.test.ts`

Pattern: H3Event integration test (real handler, no live server)

```typescript
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import healthz from "./healthz-smoke-bugfix2-524723214";

describe("GET /api/healthz-smoke-bugfix2-524723214", () => {
  it("returns HTTP 200 with correct response body", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/healthz-smoke-bugfix2-524723214")
    );

    const result = await healthz(event);

    expect(result).toEqual({ ok: true, variant: "524723214" });
  });

  it("responds in under 100ms", async () => {
    const event = new H3Event(
      new Request("http://localhost/api/healthz-smoke-bugfix2-524723214")
    );

    const start = Date.now();
    await healthz(event);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100);
  });
});
```

---

## Definition of Done

- [ ] Route handler file created at `routes/api/healthz-smoke-bugfix2-524723214.ts`
- [ ] Test file created at `routes/api/healthz-smoke-bugfix2-524723214.test.ts`
- [ ] Test passes: `bun run test routes/api/healthz-smoke-bugfix2-524723214.test.ts`
- [ ] Full verification passes: `bun run verify`
- [ ] Manual curl test confirms: `curl http://localhost:5000/api/healthz-smoke-bugfix2-524723214` returns `{"ok":true,"variant":"524723214"}` with HTTP 200

---

## Verification Steps

1. Run unit tests:

   ```bash
   bun run test routes/api/healthz-smoke-bugfix2-524723214.test.ts
   ```

2. Run full verification:

   ```bash
   bun run verify
   ```

3. Manual curl test:

   ```bash
   bun run dev &
   sleep 2
   curl http://localhost:5000/api/healthz-smoke-bugfix2-524723214
   kill %1
   ```

   Expected output: `{"ok":true,"variant":"524723214"}`

---

## Notes

- This is a self-contained endpoint with no external dependencies
- Follows the exact same pattern as `routes/api/healthz-smoke-302960562-a.ts`
- No changes needed to any other files (vite.config.ts, middleware, etc.)
- Can be implemented independently of VRTX3-T-0007 and VRTX3-T-0009
