---
ticket: VRTX3-T-0286
type: task
---

# TDD result — VRTX3-T-0286

## Test cases

| #   | Case                                                                                      | File                                           |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | `GET /api/healthz-smoke-613529736-c` handler returns `{ ok: true, variant: "613529736" }` | `routes/api/healthz-smoke-613529736-c.test.ts` |

## Red run

Command: `bun run test -- routes/api/healthz-smoke-613529736-c.test.ts`

Handler file did not exist yet. Result:

```
FAIL  |server| routes/api/healthz-smoke-613529736-c.test.ts [ routes/api/healthz-smoke-613529736-c.test.ts ]
Error: Cannot find module './healthz-smoke-613529736-c' imported from /workspace/repo/routes/api/healthz-smoke-613529736-c.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

Added `routes/api/healthz-smoke-613529736-c.ts` (copied from the pinned `healthz-smoke-528856326-a`
pair per `openspec/changes/.../design.md` § D2, `variant` changed to `"613529736"`).

Targeted run — `bun run test -- routes/api/healthz-smoke-613529736-c.test.ts`:

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate — `bun run verify` (lint + typecheck + full unit suite):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  138 passed (138)
      Tests  198 passed (198)
```

Live wiring check — dev server on `:5000` (read from the Vite banner):

```
$ curl -s -D- http://localhost:5000/api/healthz-smoke-613529736-c
HTTP/1.1 200 OK
content-type: application/json;charset=UTF-8
{"ok":true,"variant":"613529736"}
```

Production build — `bun run build`: emits `.output/server/_routes/api/healthz_smoke_613529736_c.mjs`;
`find .output/server/_routes/api -iname "*test*"` returns nothing.

TDD-RESULT: 198 passed, 0 failed
