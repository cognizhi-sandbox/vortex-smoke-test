---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0040
ticket: VRTX3-T-0269
branch: vortex/feat/VRTX3-T-0269-add-get-api-healthz-smoke-503463873-b-09e6f798
upstream: [artifacts/VRTX3-S-0040/VRTX3-T-0269/PLAN.md]
---

# TDD result — VRTX3-T-0269

## Test cases

| Test                                                                                         | Covers     | Intent                                                                                                                               |
| -------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `routes/api/healthz-smoke-503463873-b.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-4 | constructs an H3Event for the probe path, invokes the default export, asserts the result equals `{ ok: true, variant: "503463873" }` |

AC-2 (byte-identical repeat responses), AC-5 (production build output) and AC-3/AC-6 (module
shape / file count) were verified by direct measurement against the running dev server and the
production build rather than by an automated test — recorded below and in `summary.md`.

## Red run

`bun run test routes/api/healthz-smoke-503463873-b.test.ts`

```
FAIL  |server| routes/api/healthz-smoke-503463873-b.test.ts [ routes/api/healthz-smoke-503463873-b.test.ts ]
Error: Cannot find module './healthz-smoke-503463873-b' imported from /workspace/repo/routes/api/healthz-smoke-503463873-b.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

Failed because `routes/api/healthz-smoke-503463873-b.ts` did not exist yet.

## Green run

`bun run verify` (`eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0` →
`tsc --build` → `NODE_ENV=test bun --bun vitest run`)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
(no output — 0 warnings)
$ tsc --build
(no output — 0 errors)
$ NODE_ENV=test bun --bun vitest run

 Test Files  132 passed (132)
      Tests  192 passed (192)
   Duration  5.10s
```

TDD-RESULT: 192 passed, 0 failed
