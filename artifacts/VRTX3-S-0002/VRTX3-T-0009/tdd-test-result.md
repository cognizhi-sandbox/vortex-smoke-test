---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0002
ticket: VRTX3-T-0009
branch: vortex/fix/VRTX3-T-0009-smoke-bugfix-17873246012078034-api-healt-4ef9bcab
upstream: [artifacts/VRTX3-S-0002/VRTX3-T-0009/PLAN.md]
---

# TDD result — VRTX3-T-0009

> This file replaces stale content from a prior sprint that recycled this ticket key (variant
> `764107669`, committed in `e167bb8`). See `PLAN.md`'s banner.

## Test cases

| Test                                                                                               | Covers     | Intent                                                                                                       |
| -------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `routes/api/healthz-smoke-bugfix3-834560860.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-4 | handler default-exports a `defineHandler` returning the literal probe body, single assertion, no timing case |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix3-834560860.test.ts`

```
 RUN  v4.1.10 /workspace/repo

 ❯ |server| routes/api/healthz-smoke-bugfix3-834560860.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix3-834560860.test.ts [ routes/api/healthz-smoke-bugfix3-834560860.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix3-834560860' imported from /workspace/repo/routes/api/healthz-smoke-bugfix3-834560860.test.ts

 Test Files  1 failed (1)
      Tests  no tests
   Start at  15:17:34
   Duration  169ms (transform 32ms, setup 0ms, import 0ms, tests 0ms, environment 0ms)
```

## Green run

`bun run verify` (`lint && typecheck && test` — this project's full pre-commit validation gate)

```
$ bun run lint && bun run typecheck && bun run test
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ node scripts/ensure-generated-files.mjs
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 RUN  v4.1.10 /workspace/repo

 Test Files  108 passed (108)
      Tests  168 passed (168)
   Start at  15:18:13
   Duration  30.07s (transform 11.22s, setup 3.63s, import 24.74s, tests 6.90s, environment 9.30s)
```

Additionally verified outside the automated gate, per AC-2/AC-3/AC-5 (a live request is the only
check that proves Nitro registered the route — the unit test above imports the handler module
directly and would pass even without registration):

- `bun run dev` (Vite banner: `http://localhost:5000/`), then:
  - `GET /api/healthz-smoke-bugfix3-834560860` → `200`, `content-type: application/json;charset=UTF-8`,
    body `{"ok":true,"variant":"834560860"}`.
  - `GET /api/healthz-smoke-528856326-a` (control, same session) → `200`,
    `content-type: application/json;charset=UTF-8`, body `{"ok":true,"variant":"528856326"}`.
- `bun run build` → `.output/server/_routes/api/healthz_smoke_bugfix3_834560860.mjs` present;
  `find .output -name "*.test.ts"` → no matches.

TDD-RESULT: 168 passed, 0 failed
