---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0045
ticket: VRTX3-T-0301
branch: vortex/fix/VRTX3-T-0301-smoke-bugfix-178771266552323-api-healthz-295b63ea
upstream: [artifacts/VRTX3-S-0045/VRTX3-T-0301/PLAN.md]
---

# TDD result — VRTX3-T-0301

## Test cases

| Test                                                                                                                                          | Covers           | Intent                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix-1022589408.test.ts › GET /api/healthz-smoke-bugfix-1022589408 › returns HTTP 200 with correct response body` | AC-1, AC-4, AC-5 | Invokes the handler's default export directly and asserts the returned object deep-equals `{ ok: true, variant: "1022589408" }` |

AC-2, AC-3 and AC-6 are covered by live HTTP verification and a production build inspection, not by
the unit test (see `fix-note.md` § Notes); they cannot be expressed as a Vitest assertion against a
single module import.

## Red run

`bun run test -- routes/api/healthz-smoke-bugfix-1022589408.test.ts` — run before the handler file
existed:

```
 RUN  v4.1.10 /workspace/repo

 ❯ |server| routes/api/healthz-smoke-bugfix-1022589408.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix-1022589408.test.ts [ routes/api/healthz-smoke-bugfix-1022589408.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix-1022589408' imported from /workspace/repo/routes/api/healthz-smoke-bugfix-1022589408.test.ts

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

 Test Files  147 passed (147)
      Tests  207 passed (207)
   Duration  4.60s
```

Additionally confirmed by live request against `bun run dev` (port `:5004` in this container,
`:5000`-`:5003` were in use):

```
GET /api/healthz-smoke-bugfix-1022589408
  → 200, content-type: application/json;charset=UTF-8, body: {"ok":true,"variant":"1022589408"}
  repeated with a different query string and an extra header → byte-identical body

GET /api/healthz-smoke-nonexistent-xyz (unrouted control)
  → 200, content-type: text/html; charset=utf-8 (SPA shell)
```

And by `bun run build`, whose output lists
`.output/server/_routes/api/healthz_smoke_bugfix_1022589408.mjs`, with zero `.test.*` files under
`.output/`.

TDD-RESULT: 207 passed, 0 failed
