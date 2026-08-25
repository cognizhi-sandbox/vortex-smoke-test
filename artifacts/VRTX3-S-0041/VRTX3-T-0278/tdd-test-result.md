---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0041
ticket: VRTX3-T-0278
branch: vortex/feat/VRTX3-T-0278-add-get-api-healthz-smoke-865643533-c-bc78d4ea
upstream: [artifacts/VRTX3-S-0041/VRTX3-T-0278/PLAN.md]
---

# TDD result — VRTX3-T-0278

## Test cases

| Test                                                                                         | Covers           | Intent                                                                                   |
| -------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-865643533-c.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3, AC-4 | handler default export returns `{ ok: true, variant: "865643533" }` for a real `H3Event` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-865643533-c.test.ts` (handler file temporarily removed)

```
FAIL  |server| routes/api/healthz-smoke-865643533-c.test.ts [ routes/api/healthz-smoke-865643533-c.test.ts ]
Error: Cannot find module './healthz-smoke-865643533-c' imported from
/workspace/repo/routes/api/healthz-smoke-865643533-c.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` _(this stack's full gate — `lint && typecheck && test`)_

```
$ bun run lint && bun run typecheck && bun run test
✓ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
✓ tsc --build
 Test Files  135 passed (135)
      Tests  195 passed (195)
```

Also ran, per PLAN.md step 3 (live-response and build-output evidence for AC-1/AC-2/AC-5):

```
$ bun run build
.output/server/_routes/api/healthz_smoke_865643533_c.mjs   (present)
$ find .output/server -iname '*.test.ts'                   (no matches)

$ curl -s -D - http://localhost:5001/api/healthz-smoke-865643533-c
HTTP/1.1 200 OK
content-type: application/json;charset=UTF-8
{"ok":true,"variant":"865643533"}

$ curl -s -D - "http://localhost:5001/api/healthz-smoke-865643533-c?foo=bar" -H "X-Test: 1"
HTTP/1.1 200 OK
content-type: application/json;charset=UTF-8
{"ok":true,"variant":"865643533"}
(byte-identical to the first response body)
```

TDD-RESULT: 195 passed, 0 failed
