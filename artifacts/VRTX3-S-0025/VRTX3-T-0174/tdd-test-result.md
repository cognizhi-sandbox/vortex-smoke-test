---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0025
ticket: VRTX3-T-0174
branch: vortex/fix/VRTX3-T-0174-smoke-bugfix-17868824506850-api-healthz-14d75606
upstream: [artifacts/VRTX3-S-0025/VRTX3-T-0174/PLAN.md]
---

# TDD result — VRTX3-T-0174

## Test cases

| Test                                                                                               | Covers     | Intent                                                                                            |
| -------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix2-251329376.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-4 | handler returns `{ ok: true, variant: "251329376" }` deep-equal, single case, no timing assertion |

Live-request checks against a running dev server (AC-2, AC-3) and the production build output
check (AC-5) are not Vitest cases; their real command output is recorded below and in
`fix-note.md`.

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix2-251329376.test.ts` — run before the handler
file existed:

```
FAIL  |server| routes/api/healthz-smoke-bugfix2-251329376.test.ts [ routes/api/healthz-smoke-bugfix2-251329376.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-251329376' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-251329376.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun --bun vitest run routes/api/healthz-smoke-bugfix2-251329376.test.ts` — after adding the handler:

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full gate, `bun run verify` (lint && typecheck && test):

```
 Test Files  94 passed (94)
      Tests  154 passed (154)
```

Live checks on a running dev server (`http://localhost:5001`, port read from the Vite banner
"Port 5000 is in use, trying another one..."):

```
target : GET /api/healthz-smoke-bugfix2-251329376   -> 200 application/json;charset=UTF-8  {"ok":true,"variant":"251329376"}
control: GET /api/healthz-smoke-528856326-a         -> 200 application/json;charset=UTF-8  {"ok":true,"variant":"528856326"}
```

Production build (`bun run build`) then:

```
$ ls .output/server/_routes/api/ | grep bugfix2_251329376
healthz_smoke_bugfix2_251329376.mjs
```

TDD-RESULT: 1 passed, 0 failed
