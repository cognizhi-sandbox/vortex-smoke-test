---
ticket: VRTX3-T-0325
title: /api/healthz-smoke-956166896-b probe endpoint
---

## Test cases

`routes/api/healthz-smoke-956166896-b.test.ts` — one case, per `design.md` § D3 (single body
assertion, no timing case):

| #   | Case                                                        | Assertion                                                                                                                    |
| --- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | `GET /api/healthz-smoke-956166896-b` returns the fixed body | `H3Event` built for the probe path, default export invoked directly, result deep-equals `{ ok: true, variant: "956166896" }` |

## Red run

Before `routes/api/healthz-smoke-956166896-b.ts` existed:

```
$ bun run test -- routes/api/healthz-smoke-956166896-b.test.ts
 FAIL  |server| routes/api/healthz-smoke-956166896-b.test.ts [ routes/api/healthz-smoke-956166896-b.test.ts ]
Error: Cannot find module './healthz-smoke-956166896-b' imported from /workspace/repo/routes/api/healthz-smoke-956166896-b.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

After adding the handler (`routes/api/healthz-smoke-956166896-b.ts`, copied from the pinned
`healthz-smoke-528856326-a` pair per `design.md` § D2):

```
$ bun run test -- routes/api/healthz-smoke-956166896-b.test.ts
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate (`bun run verify` = lint + typecheck + full unit tier):

```
$ bun run verify
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  156 passed (156)
      Tests  216 passed (216)
```

Additional live checks against `bun run dev` (port `:5000`, read from the Vite banner):

- `GET /api/healthz-smoke-956166896-b` → `200`, `content-type: application/json;charset=UTF-8`,
  body `{"ok":true,"variant":"956166896"}` (AC-1)
- Same request with a different query string, an extra header, repeated → byte-identical response
  body (AC-2)
- `bun run build` → `.output/server/_routes/api/healthz_smoke_956166896_b.mjs` present, no
  `.test.*` file anywhere under `.output/` (AC-5)

TDD-RESULT: 216 passed, 0 failed
