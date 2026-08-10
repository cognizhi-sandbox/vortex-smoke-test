# VRTX3-T-0093 — TDD red→green proof

## Test cases

- `GET /api/healthz-smoke-bugfix2-754372119` — resolved handler value deep-equals
  `{ ok: true, variant: "754372119" }`. Single assertion, no elapsed-time case.

## Red run

Regression test written first, importing the not-yet-existing handler module:

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix2-754372119.test.ts

 FAIL  |server| routes/api/healthz-smoke-bugfix2-754372119.test.ts [ routes/api/healthz-smoke-bugfix2-754372119.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-754372119' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-754372119.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

After adding `routes/api/healthz-smoke-bugfix2-754372119.ts`:

```
$ bun --bun vitest run routes/api/healthz-smoke-bugfix2-754372119.test.ts

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full project gate, confirming zero new failures:

```
$ bun run verify
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   → pass
$ tsc --build                                                                  → pass
$ NODE_ENV=test bun --bun vitest run
 Test Files  61 passed (61)
      Tests  121 passed (121)
```

Live-server + build verification:

```
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-bugfix2-754372119
200 application/json;charset=UTF-8
body: {"ok":true,"variant":"754372119"}

$ bun run build
.output/server/_routes/api/healthz_smoke_bugfix2_754372119.mjs   emitted
$ find .output/server/_routes -iname "*test*"   → no matches
```

TDD-RESULT: 1 passed, 0 failed
