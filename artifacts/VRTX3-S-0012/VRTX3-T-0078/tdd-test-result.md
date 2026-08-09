# VRTX3-T-0078 — TDD test result

## Test cases

- `returns HTTP 200 with correct response body` — asserts the handler resolves to
  `{ ok: true, variant: "433928318" }`.
- `responds in under 100ms` — asserts the handler resolves within the 100ms budget.

Both in `routes/api/healthz-smoke-bugfix2-433928318.test.ts`.

## Red run

Ran before the handler file existed:

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix2-433928318.test.ts

 FAIL  |server| routes/api/healthz-smoke-bugfix2-433928318.test.ts [ routes/api/healthz-smoke-bugfix2-433928318.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-433928318' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-433928318.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

After adding `routes/api/healthz-smoke-bugfix2-433928318.ts`:

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix2-433928318.test.ts

 RUN  v4.1.10 /workspace/repo

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

Full suite re-run after the fix:

```
$ bun run verify
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   → pass, 0 warnings
$ tsc --build                                                                  → pass
$ NODE_ENV=test bun --bun vitest run

 Test Files  55 passed (55)
      Tests  113 passed (113)
```

Additional live verification (not part of the automated suite, per the repo's
SPA-fallback gotcha):

```
$ bun run build   → succeeded; emitted .output/server/_routes/api/healthz_smoke_bugfix2_433928318.mjs
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix2-433928318
200 application/json;charset=UTF-8
$ curl -s http://localhost:5000/api/healthz-smoke-bugfix2-433928318
{"ok":true,"variant":"433928318"}
```

TDD-RESULT: 113 passed, 0 failed
