# VRTX3-T-0002 — Fix Note

## Root Cause

Nitro 3 registers `/api/*` routes purely from files present on disk under `routes/api/` (via `vite.config.ts:29` — `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`). The file `routes/api/healthz-smoke-bugfix2-101584827.ts` did not exist, so no handler was registered for the endpoint. When a request arrived at `/api/healthz-smoke-bugfix2-101584827`, it fell past the API router and was answered by the SPA fallback with HTTP 200 and `text/html` (the `index.html` shell).

**Important**: The ticket's stated symptom ("returns 404") was incorrect. The actual symptom was HTTP 200 with `Content-Type: text/html` instead of `application/json` + the correct JSON body. The status code remained 200 both before and after the fix.

## Minimal Fix

Created exactly two new files:

1. **`routes/api/healthz-smoke-bugfix2-101584827.ts`** — default-exported `defineHandler` from `"nitro/h3"` returning `{ ok: true, variant: "101584827" }`
2. **`routes/api/healthz-smoke-bugfix2-101584827.test.ts`** — H3Event integration test asserting the body and a <100ms latency bound

No existing files were modified. No shared/parameterised helper was introduced — the handler remains self-contained and context-free, matching the convention of sibling endpoints.

## Files Touched

- **Created**: `routes/api/healthz-smoke-bugfix2-101584827.ts`
- **Created**: `routes/api/healthz-smoke-bugfix2-101584827.test.ts`
- **Modified**: none

## Verification

- ✅ Regression test written and committed
- ✅ Test failed before fix (RED phase: import error, module not found)
- ✅ Fix applied (route handler created)
- ✅ Test passes after fix (GREEN phase: 2 tests passed in 221ms)
- ✅ Full test suite passes: 37 files, 80 tests
- ✅ Lint and typecheck: zero warnings
- ✅ Endpoint responds with correct `Content-Type: application/json` and body `{"ok":true,"variant":"101584827"}`
