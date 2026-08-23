---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0034
ticket: VRTX3-T-0221
branch: vortex/fix/VRTX3-T-0221-smoke-bugfix-178747715613700-api-healthz-da1c2718
upstream: [artifacts/VRTX3-S-0034/VRTX3-T-0221/PLAN.md]
---

# TDD result — VRTX3-T-0221

## Test cases

| Test                                                                                              | Covers     | Intent                                                                                   |
| ------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix-839771954.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3 | handler returns the exact `{ ok: true, variant: "839771954" }` body via a real `H3Event` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix-839771954.test.ts`

```
FAIL  |server| routes/api/healthz-smoke-bugfix-839771954.test.ts [ routes/api/healthz-smoke-bugfix-839771954.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix-839771954' imported from
/workspace/repo/routes/api/healthz-smoke-bugfix-839771954.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` (this stack's full gate — `eslint . --max-warnings 0` + `tsc --build` +
`bun --bun vitest run`)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  114 passed (114)
      Tests  174 passed (174)
```

Also verified live per DoD-3 against `bun run dev` (bound `:5000`):

```
$ curl -s -o /tmp/body.json -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix-839771954
200 application/json;charset=UTF-8
{"ok":true,"variant":"839771954"}
```

TDD-RESULT: 174 passed, 0 failed
