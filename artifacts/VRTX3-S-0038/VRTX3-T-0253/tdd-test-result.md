---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0038
ticket: VRTX3-T-0253
branch: vortex/feat/VRTX3-T-0253-add-api-healthz-smoke-992401223-b-436b49a9
upstream: [artifacts/VRTX3-S-0038/VRTX3-T-0253/PLAN.md]
---

# TDD result — VRTX3-T-0253

## Test cases

| Test                                                                                         | Covers     | Intent                                                   |
| -------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------- |
| `routes/api/healthz-smoke-992401223-b.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-4 | handler resolves to `{ ok: true, variant: "992401223" }` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-992401223-b.test.ts`

```
FAIL  |server| routes/api/healthz-smoke-992401223-b.test.ts [ routes/api/healthz-smoke-992401223-b.test.ts ]
Error: Cannot find module './healthz-smoke-992401223-b' imported from /workspace/repo/routes/api/healthz-smoke-992401223-b.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` _(lint + typecheck + full test suite — this stack's browser-free core gate)_

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  126 passed (126)
      Tests  186 passed (186)
```

Also ran `bun run build` (production build): succeeded, emitted
`.output/server/_routes/api/healthz_smoke_992401223_b.mjs`, no `*.test.ts` in the bundle. And a live
request against `bun run dev` (`:5000`, read from the Vite banner): `200 application/json;charset=UTF-8`,
body `{"ok":true,"variant":"992401223"}`, matching the control probe `healthz-smoke-528856326-a`
(`200 application/json;charset=UTF-8`).

TDD-RESULT: 186 passed, 0 failed
