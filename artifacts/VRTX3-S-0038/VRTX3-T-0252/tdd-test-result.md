---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0038
ticket: VRTX3-T-0252
branch: vortex/feat/VRTX3-T-0252-add-api-healthz-smoke-992401223-a-7dfe2ef3
upstream: [artifacts/VRTX3-S-0038/VRTX3-T-0252/PLAN.md]
---

# TDD result — VRTX3-T-0252

## Test cases

| Test                                                                                         | Covers     | Intent                                                                |
| -------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `routes/api/healthz-smoke-992401223-a.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-4 | handler returns `{ok:true, variant:"992401223"}`, no timing assertion |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-992401223-a.test.ts` — before the handler existed:

```
FAIL  |server| routes/api/healthz-smoke-992401223-a.test.ts [ routes/api/healthz-smoke-992401223-a.test.ts ]
Error: Cannot find module './healthz-smoke-992401223-a' imported from /workspace/repo/routes/api/healthz-smoke-992401223-a.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` (lint + typecheck + full unit suite) — after the handler was added:

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  126 passed (126)
      Tests  186 passed (186)
```

Additionally verified live against `bun run dev` (port read from the Vite banner; bound `:5000` on
the first run, `:5001` on a later run — read your own banner, per AGENTS.md):

```
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-992401223-a
200 application/json;charset=UTF-8
$ curl -s http://localhost:5000/api/healthz-smoke-992401223-a
{"ok":true,"variant":"992401223"}
```

AC-2 (repeat calls, byte-identical, varying query/headers/method/body):

```
$ curl -s "http://localhost:5001/api/healthz-smoke-992401223-a?foo=1" -H "X-Test: a"
{"ok":true,"variant":"992401223"}
$ curl -s -X POST "http://localhost:5001/api/healthz-smoke-992401223-a?bar=2" -H "X-Test: b" -d '{"x":1}'
{"ok":true,"variant":"992401223"}
```

`bun run build` then produced `.output/server/_routes/api/healthz_smoke_992401223_a.mjs`, and
`find .output -name "*.test.*"` returned nothing (AC-5).

TDD-RESULT: 186 passed, 0 failed
