---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0039
ticket: VRTX3-T-0261
branch: vortex/feat/VRTX3-T-0261-probe-b-get-api-healthz-smoke-812788042-f7ecb3ed
upstream: [artifacts/VRTX3-S-0039/VRTX3-T-0261/PLAN.md]
---

# TDD result — VRTX3-T-0261

## Test cases

| Test                                                                                                                              | Covers           | Intent                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-812788042-b.test.ts › GET /api/healthz-smoke-812788042-b › returns HTTP 200 with correct response body` | AC-1, AC-3, AC-4 | Invokes the handler's default export directly with an `H3Event` and asserts the returned object deep-equals `{ ok: true, variant: "812788042" }`. |

AC-2 (byte-identical repeat responses) and AC-5 (production build output) are covered by live
verification, not the unit test — recorded under Verification in `summary.md`.

## Red run

`bun --bun vitest run routes/api/healthz-smoke-812788042-b.test.ts`

```
 RUN  v4.1.10 /workspace/repo

 ❯ |server| routes/api/healthz-smoke-812788042-b.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-812788042-b.test.ts [ routes/api/healthz-smoke-812788042-b.test.ts ]
Error: Cannot find module './healthz-smoke-812788042-b' imported from /workspace/repo/routes/api/healthz-smoke-812788042-b.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

Failed as expected: the test file was written before the handler module existed.

## Green run

`bun run verify` (lint + typecheck + full unit suite, the project's core pre-commit gate)

```
$ bun run lint && bun run typecheck && bun run test
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 RUN  v4.1.10 /workspace/repo

 Test Files  129 passed (129)
      Tests  189 passed (189)
   Duration  4.76s
```

TDD-RESULT: 189 passed, 0 failed
