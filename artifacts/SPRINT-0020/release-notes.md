# Release Notes — SPRINT-0020

**Release Date:** 2026-07-26  
**Sprint Goal:** [smoke] Bugfix sprint smoke-bugfix-178508606149177

---

## What's New

### Three Missing Health Check Endpoints Restored

SPRINT-0020 restores three health check endpoints that were previously returning 404 errors. These endpoints are now available and return HTTP 200 with health status.

#### New Endpoints

| Endpoint                                   | Response                            | Status |
| ------------------------------------------ | ----------------------------------- | ------ |
| `GET /api/healthz-smoke-bugfix-248794935`  | `{"ok":true,"variant":"248794935"}` | ✅     |
| `GET /api/healthz-smoke-bugfix2-601069474` | `{"ok":true,"variant":"601069474"}` | ✅     |
| `GET /api/healthz-smoke-bugfix3-458270372` | `{"ok":true,"variant":"458270372"}` | ✅     |

All endpoints:

- Return HTTP 200 OK
- Respond in under 100ms
- Require no authentication
- Perform no database operations
- Follow the established health-check pattern

---

## What Changed

### No Breaking Changes

This release contains only bug fixes for previously broken endpoints. No existing APIs were modified or removed.

### No Database Changes

No schema migrations, no database operations. These are purely HTTP endpoint additions.

### No Configuration Changes

No changes to `.env`, `vite.config.ts`, `tsconfig.json`, or other configuration files.

### Documentation

No updates to root documentation (AGENT.md, PRODUCT.md, ARCHITECTURE.md, DESIGN.md). These endpoints follow the established pattern documented in CLAUDE.md under "Adding Tests" and prior sprint records (SPRINT-0004, SPRINT-0005, SPRINT-0007, SPRINT-0019).

---

## Test Results

### Unit Tests

- **Total:** 48 tests across 21 test files
- **Result:** 48/48 passed (100%)
- **Duration:** 3.36 seconds
- **New Test Coverage:** 6 tests (2 per endpoint, covering response body + performance)

### E2E Tests

- **Total:** 5 Playwright specs
- **Result:** 5/5 passed (100%)
- **Duration:** 7.5 seconds
- **Verification:** All smoke tests passed; no console errors

### Code Quality

- **Linting:** ✅ Zero warnings (ESLint 9 + typescript-eslint)
- **Type Safety:** ✅ Zero errors (TypeScript strict mode)
- **Build:** ✅ Zero warnings (`bun run build`)

---

## Migration Guide

**For Users:** No action required. The previously-broken endpoints are now available at their original paths.

**For Developers:** The health-check endpoint pattern remains unchanged. New endpoints follow the same pattern documented in CLAUDE.md:

```typescript
// routes/api/healthz-<name>.ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return {
    ok: true,
    variant: "<variant-id>",
  };
});
```

---

## Known Issues

None. All acceptance criteria met. Zero defects found during integration QA.

---

## Performance

All three endpoints respond in under 10ms on typical hardware (measured during development). This is well below the 100ms acceptance threshold and provides headroom for monitoring/instrumentation in production.

---

## Security

These endpoints:

- Require no authentication
- Return no sensitive data
- Perform no database queries
- Have no external dependencies
- Follow the established security pattern from prior smoke endpoints

No security concerns identified during code review.

---

## Compatibility

- **Minimum Node.js/Bun:** Bun 1.x (no changes to runtime requirements)
- **Browser Support:** N/A (these are server-side health-check endpoints)
- **API Compatibility:** Backward compatible (additions only)

---

## Credits

**Planning:** Product team (VRTX-0093)  
**Engineering:** Engineer team (VRTX-0090, VRTX-0091, VRTX-0092)  
**QA:** QA team (VRTX-0095)

---

## How to Test Locally

```bash
# Start dev server
bun run dev

# Test endpoints in another terminal
curl http://localhost:5000/api/healthz-smoke-bugfix-248794935
# {"ok":true,"variant":"248794935"}

curl http://localhost:5000/api/healthz-smoke-bugfix2-601069474
# {"ok":true,"variant":"601069474"}

curl http://localhost:5000/api/healthz-smoke-bugfix3-458270372
# {"ok":true,"variant":"458270372"}

# Run full test suite
bun run verify:full
```

---

## Next Steps

1. ✅ All SPRINT-0020 tickets closed
2. ✅ All tests passing
3. ✅ QA approved for merge
4. → Merge to main (system will handle squash-merge)
5. → Deploy per deployment schedule
6. → Monitor endpoints in production

---

**End of Release Notes**
