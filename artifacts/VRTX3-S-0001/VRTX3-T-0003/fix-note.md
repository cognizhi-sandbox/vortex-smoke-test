# Fix Note: VRTX3-T-0003

## Root Cause

Nitro 3 registers routes from files present on disk under `routes/api/`. The file `routes/api/healthz-smoke-bugfix3-403022997.ts` did not exist, so no handler was registered for the path. The unmatched request fell through to the static/SPA fallback, returning HTTP 200 with `Content-Type: text/html` (the SPA shell) instead of the expected JSON response.

## Minimal Fix

Created two new files, copying the sibling pattern from `routes/api/healthz-smoke-bugfix3-331988924.ts` and `.test.ts`:

1. **`routes/api/healthz-smoke-bugfix3-403022997.ts`**: Default-exported `defineHandler` from `"nitro/h3"` returning `{ ok: true, variant: "403022997" }`
2. **`routes/api/healthz-smoke-bugfix3-403022997.test.ts`**: Integration test using `H3Event` over the request URL, asserting the response body and latency bound

No existing files were modified.

## Files Touched

- **Created**: `routes/api/healthz-smoke-bugfix3-403022997.ts`
- **Created**: `routes/api/healthz-smoke-bugfix3-403022997.test.ts`
- **Modified**: none

## Verification

- `GET /api/healthz-smoke-bugfix3-403022997` now returns HTTP 200 with `Content-Type: application/json`
- Response body: `{"ok":true,"variant":"403022997"}` (exactly as specified)
- All tests pass: 37 test files, 80 tests
- Full verification suite clean: lint + typecheck + tests
