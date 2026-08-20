---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0033
ticket: VRTX3-T-0216
branch: vortex/feat/VRTX3-T-0216-get-api-healthz-smoke-189360772-a-e5c72147
upstream: [artifacts/VRTX3-S-0033/VRTX3-T-0216/PLAN.md]
---

# TDD result — VRTX3-T-0216

## Test cases

| Test                                                                                         | Covers                       | Intent                                                                                            |
| -------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-189360772-a.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-2, AC-4, AC-5, AC-6 | handler returns `{ ok: true, variant: "189360772" }` deep-equal, single assertion, no timing case |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-189360772-a.test.ts`

```
FAIL  |server| routes/api/healthz-smoke-189360772-a.test.ts [ routes/api/healthz-smoke-189360772-a.test.ts ]
Error: Cannot find module './healthz-smoke-189360772-a' imported from /workspace/repo/routes/api/healthz-smoke-189360772-a.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` _(lint && typecheck && test — this stack's full pre-commit gate)_

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ node scripts/ensure-generated-files.mjs
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  105 passed (105)
      Tests  165 passed (165)
```

Additionally verified live wiring and the production build (AC-3, AC-7):

- `bun run dev` (Vite bound `:5000`) → `curl -s -D- http://localhost:5000/api/healthz-smoke-189360772-a` → `HTTP/1.1 200 OK`, `content-type: application/json;charset=UTF-8`, body `{"ok":true,"variant":"189360772"}` (33 bytes) — matches the control `/api/healthz-smoke-528856326-a`, not the 949-byte `text/html` SPA shell measured pre-ticket.
- `bun run build` → emits `.output/server/_routes/api/healthz_smoke_189360772_a.mjs`; `find .output -name "*.test.*"` → 0 matches.

TDD-RESULT: 165 passed, 0 failed
