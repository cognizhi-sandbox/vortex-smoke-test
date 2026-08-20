---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0033
ticket: VRTX3-T-0218
branch: vortex/feat/VRTX3-T-0218-get-api-healthz-smoke-189360772-c-ff1f150f
upstream: [artifacts/VRTX3-S-0033/VRTX3-T-0218/PLAN.md]
---

# TDD result — VRTX3-T-0218

## Test cases

| Test                                                                                         | Covers                 | Intent                                                                                 |
| -------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-189360772-c.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-4, AC-5, AC-6 | handler returns `{ ok: true, variant: "189360772" }`, single assertion, no timing case |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-189360772-c.test.ts` — run before the handler file existed.

```
❯ |server| routes/api/healthz-smoke-189360772-c.test.ts (0 test)
FAIL  |server| routes/api/healthz-smoke-189360772-c.test.ts
Error: Cannot find module './healthz-smoke-189360772-c' imported from
  /workspace/repo/routes/api/healthz-smoke-189360772-c.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` — this stack's full gate (`lint && typecheck && test`).

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   (clean)
$ tsc --build                                                                  (clean)
$ NODE_ENV=test bun --bun vitest run
 Test Files  105 passed (105)
      Tests  165 passed (165)
```

Additionally ran `bun run build` (production build) — succeeded, emitted
`.output/server/_routes/api/healthz_smoke_189360772_c.mjs`; `find .output/server -name "*.test.*"`
returned no matches (AC-7).

Live verification (AC-3): with `bun run dev` bound to `:5000` (read from the Vite banner),
`curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-189360772-c`
returned `200 application/json;charset=UTF-8` with body `{"ok":true,"variant":"189360772"}` — not
the 949-byte `text/html` SPA shell measured pre-ticket.

TDD-RESULT: 165 passed, 0 failed
