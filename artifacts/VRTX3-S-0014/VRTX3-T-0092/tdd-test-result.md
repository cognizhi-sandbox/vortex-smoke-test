# VRTX3-T-0092 — TDD test result

## Test cases

- `GET /api/healthz-smoke-bugfix-174694844` returns `{ ok: true, variant: "174694844" }` — the
  handler's single contract assertion, mirroring the `528856326` sibling pattern (no elapsed-time
  case).

## Red run

Live-server reproduction (pre-fix), `bun run dev`, 2026-08-10:

```
$ curl -s -o /tmp/resp.txt -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix-174694844
200 text/html; charset=utf-8
<!doctype html>...                          # SPA shell fallback — route not registered
```

Regression-test RED, with the handler file removed and the test file in place:

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix-174694844.test.ts
 FAIL  |server| routes/api/healthz-smoke-bugfix-174694844.test.ts
Error: Cannot find module './healthz-smoke-bugfix-174694844' imported from
  /workspace/repo/routes/api/healthz-smoke-bugfix-174694844.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

Handler restored; targeted test:

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix-174694844.test.ts
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Live-server re-verification (post-fix, fresh `bun run dev` restart — route table is scan-time):

```
$ curl -s -o /tmp/resp2.txt -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix-174694844
200 application/json;charset=UTF-8
{"ok":true,"variant":"174694844"}
```

Full core gate (`bun run verify` = lint && typecheck && test):

```
$ bun run verify
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0    # 0 warnings
$ tsc --build                                                                   # 0 errors
$ NODE_ENV=test bun --bun vitest run
 Test Files  61 passed (61)
      Tests  121 passed (121)
```

Production build check:

```
$ bun run build
✓ built in 55ms
$ ls .output/server/_routes/api/ | grep 174694844
healthz_smoke_bugfix_174694844.mjs
$ ls .output/server/_routes/ -R | grep -i test
                                                                                 # (no matches)
```

TDD-RESULT: 1 passed, 0 failed
