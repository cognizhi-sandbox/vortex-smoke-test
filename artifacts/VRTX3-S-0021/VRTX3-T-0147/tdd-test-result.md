---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0021
ticket: VRTX3-T-0147
branch: vortex/feat/VRTX3-T-0147-get-api-healthz-smoke-568557289-b-e7aad5b3
upstream: [artifacts/VRTX3-S-0021/VRTX3-T-0147/PLAN.md]
---

# TDD result — VRTX3-T-0147

## Test cases

| Test                                                                                         | Covers           | Intent                                                                    |
| -------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-568557289-b.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3, AC-4 | handler returns `{ ok: true, variant: "568557289" }` via a real `H3Event` |

## Red run

`bun run test -- routes/api/healthz-smoke-568557289-b.test.ts` (handler body temporarily returning `{ ok: false, variant: "wrong" }`)

```
FAIL  |server| routes/api/healthz-smoke-568557289-b.test.ts > GET /api/healthz-smoke-568557289-b > returns HTTP 200 with correct response body
AssertionError: expected { ok: false, variant: 'wrong' } to deeply equal { ok: true, variant: '568557289' }
 Test Files  1 failed (1)
      Tests  1 failed (1)
```

## Green run

`bun run test -- routes/api/healthz-smoke-568557289-b.test.ts` (handler restored to the correct literal)

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full suite re-run via `bun run verify` (`lint && typecheck && test`):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   → clean
$ tsc --build                                                                  → clean
$ NODE_ENV=test bun --bun vitest run
 Test Files  82 passed (82)
      Tests  142 passed (142)
```

Live route check (AC-2), dev server on `:5002` (`:5000`/`:5001` in use):

```
GET /api/healthz-smoke-568557289-b  → 200, content-type: application/json;charset=UTF-8
                                       {"ok":true,"variant":"568557289"}
```

Production build (AC-7): `bun run build` succeeded and emitted
`.output/server/_routes/api/healthz_smoke_568557289_b.mjs`; `find .output -name "*.test.*"` returned
nothing.

TDD-RESULT: 1 passed, 0 failed
