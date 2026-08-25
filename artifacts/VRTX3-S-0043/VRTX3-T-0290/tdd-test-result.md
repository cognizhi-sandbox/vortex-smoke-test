---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0043
ticket: VRTX3-T-0290
branch: vortex/fix/VRTX3-T-0290-smoke-bugfix-178769906754924-api-healthz-5c7aa195
upstream: [artifacts/VRTX3-S-0043/VRTX3-T-0290/PLAN.md]
---

# TDD result — VRTX3-T-0290

## Test cases

| Test                                                                                               | Covers           | Intent                                                                                             |
| -------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix2-232336916.test.ts › returns HTTP 200 with correct response body` | AC-2, AC-3, AC-6 | builds a real H3Event and asserts the handler returns exactly `{ ok: true, variant: "232336916" }` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix2-232336916.test.ts` (test file written before the handler existed)

```
FAIL  |server| routes/api/healthz-smoke-bugfix2-232336916.test.ts [ routes/api/healthz-smoke-bugfix2-232336916.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-232336916' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-232336916.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

Also confirmed live (DoD-3 baseline, before the fix): `curl` against the dev server returned
`200 text/html; charset=utf-8` (949 B, the SPA shell) for `/api/healthz-smoke-bugfix2-232336916`.

## Green run

`bun run verify` — full pre-commit gate: `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 && tsc --build && NODE_ENV=test bun --bun vitest run`

```
$ bun run lint && bun run typecheck && bun run test
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  141 passed (141)
      Tests  201 passed (201)
```

Also confirmed live against the dev server (`http://localhost:5002`, per the Vite banner —
`:5000` and `:5001` were in use):

```
HTTP/1.1 200 OK
content-type: application/json;charset=UTF-8
content-length: 33

{"ok":true,"variant":"232336916"}
```

TDD-RESULT: 201 passed, 0 failed
