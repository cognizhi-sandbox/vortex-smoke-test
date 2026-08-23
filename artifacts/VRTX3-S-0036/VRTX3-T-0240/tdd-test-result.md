---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0036
ticket: VRTX3-T-0240
branch: vortex/feat/VRTX3-T-0240-get-api-healthz-smoke-450228657-c-aaaa7b43
upstream: [artifacts/VRTX3-S-0036/VRTX3-T-0240/PLAN.md]
---

# TDD result — VRTX3-T-0240

## Test cases

| Test                                                                                         | Covers     | Intent                                                   |
| -------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------- |
| `routes/api/healthz-smoke-450228657-c.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3 | handler resolves to `{ ok: true, variant: "450228657" }` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-450228657-c.test.ts`

```
FAIL  |server| routes/api/healthz-smoke-450228657-c.test.ts [ routes/api/healthz-smoke-450228657-c.test.ts ]
Error: Cannot find module './healthz-smoke-450228657-c' imported from
/workspace/repo/routes/api/healthz-smoke-450228657-c.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` _(lint + typecheck + full test suite — this stack's browser-free core gate)_

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  120 passed (120)
      Tests  180 passed (180)
```

Also ran `bun run build` (production build): succeeded, emitted
`.output/server/_routes/api/healthz_smoke_450228657_c.mjs`, no `*.test.ts` in the bundle. And a live
request against `bun run dev` (bound `:5001`, read from the Vite banner):
`200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"450228657"}` — distinct from the
`200 text/html; charset=utf-8` (949 B) SPA shell that path returned before this ticket.

TDD-RESULT: 180 passed, 0 failed
