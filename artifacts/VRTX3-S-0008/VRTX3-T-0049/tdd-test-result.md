# TDD Test Result — VRTX3-T-0049

## Test design

Single regression test file, H3Event integration pattern (copied from the working control
`routes/api/healthz-smoke-bugfix3-605591646.test.ts`):

`routes/api/healthz-smoke-bugfix-739648350.test.ts`

- Constructs a real `H3Event` from a `Request` (no live server).
- Calls the handler's default export directly.
- Asserts `result` deep-equals `{ ok: true, variant: "739648350" }` — asserts on the
  **body**, never on a status-code transition (per the sprint-wide gotcha: an unmatched
  `/api/*` path returns `200 text/html` from the SPA fallback, not `404`, so a
  status-only check can't distinguish broken from fixed).
- Second case is a latency smoke check (`<100ms`), matching sibling pattern.

## RED — before the fix

Test file committed first, handler module `routes/api/healthz-smoke-bugfix-739648350.ts`
did not yet exist.

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix-739648350.test.ts

 RUN  v4.1.10 /workspace/repo

 ❯ |server| routes/api/healthz-smoke-bugfix-739648350.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix-739648350.test.ts [ routes/api/healthz-smoke-bugfix-739648350.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix-739648350' imported from /workspace/repo/routes/api/healthz-smoke-bugfix-739648350.test.ts

 Test Files  1 failed (1)
      Tests  no tests
   Start at  13:38:28
   Duration  60ms (transform 12ms, setup 0ms, import 0ms, tests 0ms, environment 0ms)
error: "vitest" exited with code 1
```

Genuine RED — the suite fails to even collect, because the module under test is missing.

## GREEN — after the fix

Added `routes/api/healthz-smoke-bugfix-739648350.ts` (default-exported `defineHandler`
returning `{ ok: true, variant: "739648350" }`).

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix-739648350.test.ts

 RUN  v4.1.10 /workspace/repo

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  13:38:32
   Duration  61ms (transform 15ms, setup 0ms, import 22ms, tests 2ms, environment 0ms)
```

## Full gate

```
$ bun run verify
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  46 passed (46)
      Tests  98 passed (98)
   Start at  13:38:38
   Duration  2.16s
```

Lint (zero-warning), typecheck, and the full Vitest suite (all 46 files / 98 tests,
including every pre-existing route) pass together.

## Manual runtime check (the honest signal, per sprint notes)

`bun run dev`, then curl against the fixed path and the working control:

```
$ curl -s -w '\nSTATUS:%{http_code} CT:%{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix-739648350
{"ok":true,"variant":"739648350"}
STATUS:200 CT:application/json;charset=UTF-8

$ curl -s -w '\nSTATUS:%{http_code} CT:%{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix3-605591646
{"ok":true,"variant":"605591646"}
STATUS:200 CT:application/json;charset=UTF-8
```

Fixed endpoint now matches the control exactly: `200`, `application/json;charset=UTF-8`,
correct body — no longer the SPA `text/html` fallback.
