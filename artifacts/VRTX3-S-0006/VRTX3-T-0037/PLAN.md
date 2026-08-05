# STORY Plan — VRTX3-T-0037

**Title:** Health Check Endpoint `/api/healthz-smoke-913793173-c`

**Parent Epic:** VRTX3-T-0034

**Sprint:** VRTX3-S-0006

**Created:** 2026-08-05

---

## User Story

As a sprint owner, I want to add a simple health-check endpoint without planning overhead, so that I can unblock smoke tests on independent variants.

## Acceptance Criteria (from idea)

- GET `/api/healthz-smoke-913793173-c` responds with HTTP 200 and `{ "ok": true, "variant": "913793173" }`
- Endpoint responds within 100ms (no blocking I/O, no database queries)
- Endpoint has integration tests confirming response body and status code
- Endpoint is implemented in its own standalone file with no shared dependencies or helper code

## Implementation

### Related TASK

**VRTX3-T-0040** — Implement `/api/healthz-smoke-913793173-c`

See `artifacts/VRTX3-S-0006/VRTX3-T-0040/PLAN.md` for detailed implementation plan.

### File Ownership Map

- `routes/api/healthz-smoke-913793173-a.ts` — Route handler (VRTX3-T-0035 owns)
- `routes/api/healthz-smoke-913793173-b.ts` — Route handler (VRTX3-T-0036 owns)
- `routes/api/healthz-smoke-913793173-c.ts` — Route handler (this story owns)

**No shared code** — Each endpoint is completely independent, no imports between them.

## Parallel Development

This story can be worked in parallel with:

- **VRTX3-T-0035** — Endpoint `/api/healthz-smoke-913793173-a`
- **VRTX3-T-0036** — Endpoint `/api/healthz-smoke-913793173-b`

All three stories work independently on separate route files with no interdependencies.

## Testing

Integration test using H3Event pattern (no live server):

- Import handler from route file
- Create H3Event with test request
- Assert response body: `{ ok: true, variant: "913793173" }`
- Assert latency: <100ms

See `routes/api/healthz-smoke-302960562-c.test.ts` for pattern reference.

## Success Criteria

✅ Route file exists at `routes/api/healthz-smoke-913793173-c.ts`  
✅ Test file exists at `routes/api/healthz-smoke-913793173-c.test.ts`  
✅ Both files pass `bun run verify` (lint, typecheck, test)  
✅ Endpoint returns `{ "ok": true, "variant": "913793173" }` at HTTP 200  
✅ Response latency <100ms  
✅ No imports from other route files

## Related Documentation

- Epic Plan: [artifacts/VRTX3-S-0006/VRTX3-T-0034/PLAN.md](../VRTX3-T-0034/PLAN.md)
- Sprint Plan: [artifacts/VRTX3-S-0006/SPRINT-PLAN.md](../SPRINT-PLAN.md)
- Task Plan: [artifacts/VRTX3-S-0006/VRTX3-T-0040/PLAN.md](../VRTX3-T-0040/PLAN.md)
- Operating Manual: [AGENT.md](../../../AGENT.md#adding-tests)
