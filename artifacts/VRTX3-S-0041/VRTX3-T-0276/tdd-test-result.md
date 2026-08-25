---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0041
ticket: VRTX3-T-0276
branch: vortex/feat/VRTX3-T-0276-add-get-api-healthz-smoke-865643533-a-e75c55cc
---

# TDD result — VRTX3-T-0276

## Test cases

| ID   | Case                                                                                                                                         | File                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| TC-1 | `GET /api/healthz-smoke-865643533-a` returns `{ ok: true, variant: "865643533" }` when the handler is invoked directly with a real `H3Event` | `routes/api/healthz-smoke-865643533-a.test.ts` |

Single case, no wall-clock timing assertion — matches the pinned `healthz-smoke-528856326-a` shape, not the 47 legacy probes that carry a `responds in under 100ms` case.

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-865643533-a.test.ts` (run before `routes/api/healthz-smoke-865643533-a.ts` existed)

```
FAIL  |server| routes/api/healthz-smoke-865643533-a.test.ts [ routes/api/healthz-smoke-865643533-a.test.ts ]
Error: Cannot find module './healthz-smoke-865643533-a' imported from /workspace/repo/routes/api/healthz-smoke-865643533-a.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

Command: `bun --bun vitest run routes/api/healthz-smoke-865643533-a.test.ts` (after adding the handler)

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate — `bun run verify` (lint + `tsc --build` + `NODE_ENV=test bun --bun vitest run`, the whole unit tier, not just this file):

```
 Test Files  135 passed (135)
      Tests  195 passed (195)
```

Exit code: 0.

## Additional verification (per PLAN.md step 3)

- `bun run dev` → bound `:5000` (banner: `Local: http://localhost:5000/`).
  `curl -s -D - "http://localhost:5000/api/healthz-smoke-865643533-a?x=1" -H "X-Test: a"`
  → `200`, `content-type: application/json;charset=UTF-8` — body `{"ok":true,"variant":"865643533"}`.
- Second request with a different method (`POST`), header (`X-Test: b`) and a request body produced a byte-identical response (`diff` empty).
- `bun run build` → exit 0. `.output/server/_routes/api/healthz_smoke_865643533_a.mjs` exists; no `.test.ts` file present under `.output/`.

TDD-RESULT: 195 passed, 0 failed
