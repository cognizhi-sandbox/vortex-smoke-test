---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0027
ticket: VRTX3-T-0190
branch: vortex/feat/VRTX3-T-0190-get-api-healthz-smoke-868033827-b-8f8af92a
upstream: [artifacts/VRTX3-S-0027/VRTX3-T-0190/PLAN.md]
---

# TDD result — VRTX3-T-0190

## Test cases

| Test                                                                                         | Covers           | Intent                                                                                                                   |
| -------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `routes/api/healthz-smoke-868033827-b.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3, AC-4 | handler returns `{ ok: true, variant: "868033827" }` for a direct-invocation `H3Event`, single assertion, no timing case |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-868033827-b.test.ts`

```
FAIL  |server| routes/api/healthz-smoke-868033827-b.test.ts [ routes/api/healthz-smoke-868033827-b.test.ts ]
Error: Cannot find module './healthz-smoke-868033827-b' imported from /workspace/repo/routes/api/healthz-smoke-868033827-b.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` (this stack's full gate — `lint && typecheck && test`)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  97 passed (97)
      Tests  157 passed (157)
```

Additionally verified beyond the gate:

- `bun run build` — succeeded, emitted `.output/server/_routes/api/healthz_smoke_868033827_b.mjs`; `find .output -iname "*.test.*"` returned nothing.
- Live request on `bun run dev` (bound `:5000`): `GET /api/healthz-smoke-868033827-b` → `200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"868033827"}` (33 B) — matches the control `/api/healthz-smoke-528856326-a`, not the 949 B `text/html` SPA shell. `POST` to the same path also returned `200` (method-agnostic, per AC).

TDD-RESULT: 157 passed, 0 failed
