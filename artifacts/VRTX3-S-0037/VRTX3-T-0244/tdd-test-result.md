---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0037
ticket: VRTX3-T-0244
branch: vortex/fix/VRTX3-T-0244-smoke-bugfix-178752663253832-api-healthz-5139d088
upstream: [artifacts/VRTX3-S-0037/VRTX3-T-0244/PLAN.md]
---

# TDD result — VRTX3-T-0244

## Test cases

| Test                                                                                               | Covers                 | Intent                                                      |
| -------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix2-386341015.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3, AC-4, AC-5 | handler returns the exact literal body via a real `H3Event` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix2-386341015.test.ts` (before the handler file existed)

```
FAIL  |server| routes/api/healthz-smoke-bugfix2-386341015.test.ts [ routes/api/healthz-smoke-bugfix2-386341015.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-386341015' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-386341015.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` (project's full pre-commit gate — lint + typecheck + complete unit suite)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  123 passed (123)
      Tests  183 passed (183)
```

Additionally verified beyond `verify`, per this ticket's acceptance criteria:

- Live request on a running dev server (`:5002`): `curl -s -o /tmp/body.txt -w '%{http_code} %{content_type}\n' http://localhost:5002/api/healthz-smoke-bugfix2-386341015` →
  `200 application/json;charset=UTF-8` with body `{"ok":true,"variant":"386341015"}` (AC-2).
- `bun run build` → `.output/server/_routes/api/healthz_smoke_bugfix2_386341015.mjs` present (AC-6).

TDD-RESULT: 183 passed, 0 failed
