# TDD test result — VRTX3-T-0044

Regression test: `routes/api/healthz-smoke-bugfix2-279986033.test.ts`

## RED — before the fix (handler file absent)

Command:

```
bun --bun vitest run routes/api/healthz-smoke-bugfix2-279986033.test.ts
```

Actual output:

```
 RUN  v4.1.10 /workspace/repo

 ❯ |server| routes/api/healthz-smoke-bugfix2-279986033.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix2-279986033.test.ts [ routes/api/healthz-smoke-bugfix2-279986033.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-279986033' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-279986033.test.ts
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  12:56:08
   Duration  73ms (transform 13ms, setup 0ms, import 0ms, tests 0ms, environment 0ms)

error: "vitest" exited with code 1
```

This confirms the failure mode is "module absent", matching the plan's root cause. (Note: per the
ticket's own investigation and reconfirmed here, a status-code assertion over HTTP would NOT have
reproduced the bug — the SPA fallback answers unmatched `/api/*` paths with `200 text/html`, so a
404-based test was deliberately not used.)

## GREEN — after adding `routes/api/healthz-smoke-bugfix2-279986033.ts`

Command:

```
bun --bun vitest run routes/api/healthz-smoke-bugfix2-279986033.test.ts
```

Actual output:

```
 RUN  v4.1.10 /workspace/repo


 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  12:56:13
   Duration  62ms (transform 15ms, setup 0ms, import 23ms, tests 2ms, environment 0ms)
```

## Full gate — `bun run verify` (lint + typecheck + full test suite)

```
$ bun run lint && bun run typecheck && bun run test
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ node scripts/ensure-generated-files.mjs
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 RUN  v4.1.10 /workspace/repo


 Test Files  43 passed (43)
      Tests  92 passed (92)
   Start at  12:56:18
   Duration  2.15s (transform 265ms, setup 321ms, import 624ms, tests 495ms, environment 1.23s)
```

All 43 suites / 92 tests pass, zero lint warnings, clean typecheck.

## Manual runtime verification (`bun run dev`, port 5000)

```
$ curl -s -w '\nSTATUS:%{http_code} CT:%{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix2-279986033
{"ok":true,"variant":"279986033"}
STATUS:200 CT:application/json;charset=UTF-8

$ curl -s -w '\nSTATUS:%{http_code} CT:%{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix3-764107669
{"ok":true,"variant":"764107669"}
STATUS:200 CT:application/json;charset=UTF-8
```

Matches the control endpoint's shape exactly — `200`, `application/json;charset=UTF-8`, exact
body. Confirms the route is now registered and serving JSON, not falling through to the SPA
`index.html` fallback.
