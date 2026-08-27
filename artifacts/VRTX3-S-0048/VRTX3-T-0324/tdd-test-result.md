---
name: VRTX3-T-0324-tdd-test-result
description: Red/green proof for the /api/healthz-smoke-956166896-a probe
metadata:
  type: tdd-test-result
  ticket: VRTX3-T-0324
---

## Test cases

`routes/api/healthz-smoke-956166896-a.test.ts`, copied from the pinned
`healthz-smoke-528856326-a.test.ts` pair (`design.md` § D2, § D3):

- One `it` block: builds an `H3Event` for `GET /api/healthz-smoke-956166896-a`, invokes the
  handler's default export, asserts `result` deep-equals `{ ok: true, variant: "956166896" }`.
  No wall-clock/timing assertion (AC-4).

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-956166896-a.test.ts`, run with only the
test file present (handler not yet created):

```
FAIL  |server| routes/api/healthz-smoke-956166896-a.test.ts
Error: Cannot find module './healthz-smoke-956166896-a' imported from
/workspace/repo/routes/api/healthz-smoke-956166896-a.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

After adding `routes/api/healthz-smoke-956166896-a.ts` (copied from the pinned pair, variant
string changed to `"956166896"`):

Command: `bun --bun vitest run routes/api/healthz-smoke-956166896-a.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate, `bun run verify` (lint + typecheck + full unit suite):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   → clean
$ tsc --build                                                                  → clean
$ NODE_ENV=test bun --bun vitest run

 Test Files  156 passed (156)
      Tests  216 passed (216)
```

Live-server verification (AC-1, AC-2 — status code alone cannot prove routing on this stack, see
`design.md` § Measured context):

```
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-956166896-a
200 application/json;charset=UTF-8
body: {"ok":true,"variant":"956166896"}

$ curl -s -X POST http://localhost:5000/api/healthz-smoke-956166896-a   (differing method/query/headers)
200 application/json;charset=UTF-8
body: {"ok":true,"variant":"956166896"}   (byte-identical to the GET response)
```

Build-output verification (AC-5):

```
$ bun run build
$ ls .output/server/_routes/api/healthz_smoke_956166896_a.mjs
.output/server/_routes/api/healthz_smoke_956166896_a.mjs   (present)
$ find .output -iname "*.test.*"
(no output — no test file leaked into the build)
```

TDD-RESULT: 216 passed, 0 failed
