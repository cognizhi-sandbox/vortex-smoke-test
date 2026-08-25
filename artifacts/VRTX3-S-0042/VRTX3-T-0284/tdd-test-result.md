---
ticket: VRTX3-T-0284
change: vrtx3-i-0051-smoke-178768361938065-3-independent-endpoints-61
---

# TDD result — VRTX3-T-0284

## Test cases

`routes/api/healthz-smoke-613529736-a.test.ts`, copied from the pinned `528856326` pair
(`AGENTS.md` § Health Probe Routes, design.md § D2):

- **returns HTTP 200 with correct response body** — constructs an `H3Event` for
  `GET /api/healthz-smoke-613529736-a`, invokes the module's default export, asserts the
  result equals `{ ok: true, variant: "613529736" }`. No wall-clock assertion (per D2/AC-4).

## Red run

Command: `bun run test -- routes/api/healthz-smoke-613529736-a.test.ts`

Test file was written before the handler existed.

```
FAIL  |server| routes/api/healthz-smoke-613529736-a.test.ts [ routes/api/healthz-smoke-613529736-a.test.ts ]
Error: Cannot find module './healthz-smoke-613529736-a' imported from /workspace/repo/routes/api/healthz-smoke-613529736-a.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

Exit code: 1.

## Green run

After adding `routes/api/healthz-smoke-613529736-a.ts`:

Command: `bun run test -- routes/api/healthz-smoke-613529736-a.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Exit code: 0.

Full pre-commit gate: `bun run verify` (lint → typecheck → test)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  138 passed (138)
      Tests  198 passed (198)
```

Exit code: 0. 138 test files = 137 baseline (design.md § Context) + 1 new.

## Additional verification (AC-1, AC-2, AC-5)

Live dev server (port read from Vite banner, `:5001`; `:5000` was in use):

```
$ curl -s -o /tmp/body.json -w '%{http_code} %{content_type}\n' http://localhost:5001/api/healthz-smoke-613529736-a
200 application/json;charset=UTF-8
{"ok":true,"variant":"613529736"}

$ curl -s -o /tmp/body2.json -w '%{http_code} %{content_type}\n' "http://localhost:5001/api/healthz-smoke-613529736-a?foo=bar" -H "X-Test: yes"
200 application/json;charset=UTF-8
{"ok":true,"variant":"613529736"}

$ diff /tmp/body.json /tmp/body2.json
(no diff — byte-identical)
```

Production build (`bun run build`), route output inspected:

```
$ find .output/server/_routes/api -iname "*613529736_a*"
.output/server/_routes/api/healthz_smoke_613529736_a.mjs

$ find .output/server/_routes/api -iname "*test*"
(no matches)
```

TDD-RESULT: 198 passed, 0 failed
