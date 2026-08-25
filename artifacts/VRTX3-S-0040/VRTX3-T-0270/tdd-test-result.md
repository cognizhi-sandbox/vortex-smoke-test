---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0040
ticket: VRTX3-T-0270
branch: vortex/feat/VRTX3-T-0270-add-get-api-healthz-smoke-503463873-c-a9ec0965
---

# TDD result — VRTX3-T-0270

## Test cases

| ID   | Case                                                                                                                                         | File                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| TC-1 | `GET /api/healthz-smoke-503463873-c` returns `{ ok: true, variant: "503463873" }` when the handler is invoked directly with a real `H3Event` | `routes/api/healthz-smoke-503463873-c.test.ts` |

Single case, no wall-clock timing assertion — matches the pinned `healthz-smoke-528856326-a` shape, not the 47 legacy probes that carry a `responds in under 100ms` case.

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-503463873-c.test.ts` (run before `routes/api/healthz-smoke-503463873-c.ts` existed)

```
FAIL  |server| routes/api/healthz-smoke-503463873-c.test.ts [ routes/api/healthz-smoke-503463873-c.test.ts ]
Error: Cannot find module './healthz-smoke-503463873-c' imported from /workspace/repo/routes/api/healthz-smoke-503463873-c.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

Command: `bun --bun vitest run routes/api/healthz-smoke-503463873-c.test.ts` (after adding the handler)

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate — `bun run verify` (lint + `tsc --build` + `NODE_ENV=test bun --bun vitest run`, the whole unit tier, not just this file):

```
 Test Files  132 passed (132)
      Tests  192 passed (192)
```

Exit code: 0.

## Additional verification (per PLAN.md step 3)

- `bun run dev` → bound `:5000` (banner: `Local: http://localhost:5000/`).
  `curl -s -D - http://localhost:5000/api/healthz-smoke-503463873-c`
  → `200`, `content-type: application/json;charset=UTF-8` — body `{"ok":true,"variant":"503463873"}`.
- Second request with a query string, an extra header (`?foo=bar`, `X-Test: abc`) and a request body produced a byte-identical response (`diff` empty).
- `bun run build` → exit 0. `.output/server/_routes/api/healthz_smoke_503463873_c.mjs` exists; no `.test.ts` file present under `.output/`.

TDD-RESULT: 192 passed, 0 failed
