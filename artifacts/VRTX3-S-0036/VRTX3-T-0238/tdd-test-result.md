---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0036
ticket: VRTX3-T-0238
branch: vortex/feat/VRTX3-T-0238-get-api-healthz-smoke-450228657-a-42eb2153
upstream: [artifacts/VRTX3-S-0036/VRTX3-T-0238/PLAN.md]
---

# TDD result — VRTX3-T-0238

## Test cases

| Test                                                                                         | Covers     | Intent                                                                           |
| -------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-450228657-a.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3 | handler returns `{ ok: true, variant: "450228657" }` for a constructed `H3Event` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-450228657-a.test.ts` with the handler file temporarily removed:

```
FAIL  |server| routes/api/healthz-smoke-450228657-a.test.ts [ routes/api/healthz-smoke-450228657-a.test.ts ]
Error: Cannot find module './healthz-smoke-450228657-a' imported from /workspace/repo/routes/api/healthz-smoke-450228657-a.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` _(this stack's full gate — lint, typecheck, unit test suite)_

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  120 passed (120)
      Tests  180 passed (180)
```

Additional live-route and build evidence (beyond the gate, per PLAN.md step 3-4):

```
$ curl -s -o /tmp/body.json -w '%{http_code} %{content_type}\n' http://localhost:5001/api/healthz-smoke-450228657-a
200 application/json;charset=UTF-8
$ cat /tmp/body.json
{"ok":true,"variant":"450228657"}

$ bun run build
.output/server/_routes/api/healthz_smoke_450228657_a.mjs   0.32 kB
(no *.test.ts under .output/server)
```

TDD-RESULT: 180 passed, 0 failed
