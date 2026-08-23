---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0035
ticket: VRTX3-T-0230
branch: vortex/feat/VRTX3-T-0230-get-api-healthz-smoke-180848429-a-ec45ed0f
upstream: [artifacts/VRTX3-S-0035/VRTX3-T-0230/PLAN.md]
---

# TDD result — VRTX3-T-0230

## Test cases

| Test                                                                                         | Covers     | Intent                                                   |
| -------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------- |
| `routes/api/healthz-smoke-180848429-a.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-5 | handler resolves to `{ ok: true, variant: "180848429" }` |

## Red run

`bun run test -- routes/api/healthz-smoke-180848429-a.test.ts`

```
FAIL  |server| routes/api/healthz-smoke-180848429-a.test.ts
Error: Cannot find module './healthz-smoke-180848429-a' imported from
/workspace/repo/routes/api/healthz-smoke-180848429-a.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` _(lint + typecheck + full test suite — this stack's browser-free core gate)_

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  117 passed (117)
      Tests  177 passed (177)
```

Also ran `bun run build` (production build): succeeded, emitted
`.output/server/_routes/api/healthz_smoke_180848429_a.mjs`, no `*.test.ts` in the bundle. And a live
request against `bun run dev` (`:5000`): `200 application/json;charset=UTF-8`,
body `{"ok":true,"variant":"180848429"}`.

TDD-RESULT: 177 passed, 0 failed
