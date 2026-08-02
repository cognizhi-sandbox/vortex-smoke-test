# Fix Note: VRTX3-T-0013 — /api/healthz-smoke-bugfix-26031336 → 404

## Root Cause

The route file `routes/api/healthz-smoke-bugfix-26031336.ts` did not exist. Nitro's file-based router had no handler for this endpoint, causing all GET requests to return HTTP 404 Not Found.

## Minimal Fix

Created two self-contained files following the established healthz endpoint pattern:

1. **`routes/api/healthz-smoke-bugfix-26031336.ts`** — H3 handler that returns `{ok: true, variant: "26031336"}`
2. **`routes/api/healthz-smoke-bugfix-26031336.test.ts`** — Vitest integration tests (H3Event-based, no live server)

The implementation is a direct copy of the pattern from existing working endpoints (e.g., `healthz-smoke-bugfix-106285986`), with only the variant ID changed.

## Files Modified

- Created: `routes/api/healthz-smoke-bugfix-26031336.ts`
- Created: `routes/api/healthz-smoke-bugfix-26031336.test.ts`
- No changes to existing endpoints, configuration, or documentation

## Verification

All tests pass (62 tests across 28 test files), linting passes with zero warnings, and TypeScript type checking is clean. The endpoint now responds with HTTP 200 and the correct JSON body when accessed at `http://localhost:5000/api/healthz-smoke-bugfix-26031336`.
