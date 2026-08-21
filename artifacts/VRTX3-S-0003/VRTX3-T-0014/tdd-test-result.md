---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0003
ticket: VRTX3-T-0014
branch: vortex/fix/VRTX3-T-0014-smoke-bugfix-17873270732264355-api-healt-4223d7ce
upstream: [artifacts/VRTX3-S-0003/VRTX3-T-0014/PLAN.md]
---

# TDD result — VRTX3-T-0014

> This file replaces a stale record from an earlier sprint that reused this ticket key and reported
> a completed fix for a different endpoint (`/api/healthz-smoke-bugfix2-59156521`). That record is
> not this ticket's; this is the current, correct one.

## Test cases

| Test                                                                                               | Covers                 | Intent                                                                            |
| -------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix2-664793322.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-2, AC-3, AC-4 | route exists, handler shape is correct, body matches exactly, no timing assertion |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix2-664793322.test.ts` — run before the handler
file existed:

```
 FAIL  |server| routes/api/healthz-smoke-bugfix2-664793322.test.ts [ routes/api/healthz-smoke-bugfix2-664793322.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-664793322' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-664793322.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` (this stack's full gate — lint, typecheck, full test suite):

```
$ bun run lint && bun run typecheck && bun run test
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ node scripts/ensure-generated-files.mjs
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 RUN  v4.1.10 /workspace/repo

 Test Files  111 passed (111)
      Tests  171 passed (171)
   Start at  15:56:58
   Duration  24.24s
```

Additionally verified live (AC-5): `curl -s -o /dev/null -w '%{http_code} %{content_type}\n'
http://localhost:5000/api/healthz-smoke-bugfix2-664793322` against `bun run dev` (Vite bound
`:5000`) returned `200 application/json;charset=UTF-8` with body
`{"ok":true,"variant":"664793322"}`.

TDD-RESULT: 171 passed, 0 failed
