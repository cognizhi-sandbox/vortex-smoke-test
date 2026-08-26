---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0044
ticket: VRTX3-T-0297
branch: vortex/fix/VRTX3-T-0297-smoke-bugfix-178771128043004-api-healthz-8b500764
upstream: [artifacts/VRTX3-S-0044/VRTX3-T-0297/PLAN.md]
---

# TDD result — VRTX3-T-0297

## Test cases

| Test                                                                                                                                            | Covers           | Intent                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix3-1056287485.test.ts › GET /api/healthz-smoke-bugfix3-1056287485 › returns HTTP 200 with correct response body` | AC-1, AC-4, AC-5 | Invokes the handler's default export directly and asserts the returned object deep-equals `{ ok: true, variant: "1056287485" }` |

AC-2, AC-3 and AC-6 are covered by live HTTP verification and a production build inspection, not by
the unit test (see `fix-note.md` § Notes); they cannot be expressed as a Vitest assertion against a
single module import.

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix3-1056287485.test.ts` — run before the handler
file existed:

```
 RUN  v4.1.10 /workspace/repo

 ❯ |server| routes/api/healthz-smoke-bugfix3-1056287485.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix3-1056287485.test.ts [ routes/api/healthz-smoke-bugfix3-1056287485.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix3-1056287485' imported from /workspace/repo/routes/api/healthz-smoke-bugfix3-1056287485.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` (lint + typecheck + full test suite), run after adding the handler:

```
$ bun run lint && bun run typecheck && bun run test
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ node scripts/ensure-generated-files.mjs
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 RUN  v4.1.10 /workspace/repo

 Test Files  144 passed (144)
      Tests  204 passed (204)
   Duration  5.71s
```

Additionally confirmed by live request against `bun run dev` (port `:5002` in this container):

```
GET /api/healthz-smoke-bugfix3-1056287485
  → 200, content-type: application/json;charset=UTF-8, body: {"ok":true,"variant":"1056287485"}
  repeated with a different query string and an extra header → byte-identical body

GET /api/healthz-smoke-doesnotexist-999 (unrouted control)
  → 200, content-type: text/html; charset=utf-8, 949 bytes (SPA shell)
```

And by `bun run build`, whose output lists
`.output/server/_routes/api/healthz_smoke_bugfix3_1056287485.mjs`, with zero `.test.*` files under
`.output/`.

TDD-RESULT: 204 passed, 0 failed
