# Release Notes — Sprint VRTX3-S-0003

**Release Date:** 2026-08-02  
**Sprint Key:** VRTX3-S-0003  
**Branch:** `vortex/sprint/vrtx3-s-0003-c7a412cb` → merged to dev

---

## Summary

Fixed three missing health check endpoints that were returning HTTP 404 errors. All endpoints now respond with HTTP 200 and the expected JSON payload (`{ ok: true, variant: "<id>" }`). Each endpoint is self-contained with no dependencies on database, auth, or shared code.

---

## What's New

### Three Health Check Endpoints Restored

| Endpoint                                   | Status             | Response                             |
| ------------------------------------------ | ------------------ | ------------------------------------ |
| `GET /api/healthz-smoke-bugfix-26031336`   | ✅ Fixed (was 404) | `{ ok: true, variant: "26031336" }`  |
| `GET /api/healthz-smoke-bugfix2-59156521`  | ✅ Fixed (was 404) | `{ ok: true, variant: "59156521" }`  |
| `GET /api/healthz-smoke-bugfix3-200192357` | ✅ Fixed (was 404) | `{ ok: true, variant: "200192357" }` |

Each endpoint:

- Returns HTTP 200 OK
- Responds in <100ms
- Has full test coverage (H3Event integration tests)
- Follows the established healthz pattern with no code sharing

---

## How to Test

### Via CLI (dev server)

```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Test each endpoint
curl http://localhost:5000/api/healthz-smoke-bugfix-26031336
# { "ok": true, "variant": "26031336" }

curl http://localhost:5000/api/healthz-smoke-bugfix2-59156521
# { "ok": true, "variant": "59156521" }

curl http://localhost:5000/api/healthz-smoke-bugfix3-200192357
# { "ok": true, "variant": "200192357" }
```

### Via Tests

```bash
# Run all tests
bun run test

# Test a specific endpoint
bun run test routes/api/healthz-smoke-bugfix-26031336.test.ts
bun run test routes/api/healthz-smoke-bugfix2-59156521.test.ts
bun run test routes/api/healthz-smoke-bugfix3-200192357.test.ts
```

---

## Root Cause & Fix

**What Was Wrong:**  
Three route files were missing from `routes/api/`, causing Nitro's file-based router to return 404 for all requests to these endpoints.

**How It Was Fixed:**  
Added the three missing route files with simple H3 event handlers, plus corresponding Vitest integration tests. Each endpoint is self-contained and independent.

**Files Added:**

- `routes/api/healthz-smoke-bugfix-26031336.ts` + `.test.ts`
- `routes/api/healthz-smoke-bugfix2-59156521.ts` + `.test.ts`
- `routes/api/healthz-smoke-bugfix3-200192357.ts` + `.test.ts`

---

## Quality Gates

✅ **Linting:** `bun run lint` — zero warnings  
✅ **Type Safety:** `bun run typecheck` — full TypeScript strict mode  
✅ **Tests:** `bun run test` — all tests pass (new + existing)  
✅ **Integration:** `bun run test:smoke` — smoke test passes  
✅ **Verification:** `bun run verify` — full core gate passes

---

## Known Issues

None. All defects are fixed and verified.

---

## Deployment

The sprint branch has been merged to dev. No additional deployment steps required.

---

## Support & Feedback

For questions or issues with these endpoints:

1. Check the test files: `routes/api/healthz-smoke-bugfix-*.test.ts` — each test documents expected behavior
2. Review the route files: `routes/api/healthz-smoke-bugfix-*.ts` — implementation is intentionally simple for auditability
3. See [AGENT.md → Adding Tests](./CLAUDE.md#adding-tests) for test pattern documentation

---

## Related

- **Sprint VRTX3-S-0002** (2026-08-02): Fixed three similar missing endpoints (`healthz-smoke-bugfix-106285986`, `healthz-smoke-bugfix2-524723214`, `healthz-smoke-bugfix3-764107669`)
- **Sprint SPRINT-0019** (2026-07-26): Established the health check pattern with endpoints a/b/c
