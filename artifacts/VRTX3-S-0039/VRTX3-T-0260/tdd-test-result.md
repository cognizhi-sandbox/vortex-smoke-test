---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0039
ticket: VRTX3-T-0260
branch: vortex/feat/VRTX3-T-0260-probe-a-get-api-healthz-smoke-812788042-b93538e4
---

# TDD result — VRTX3-T-0260

## Test cases

| ID   | Case                                                                                                                                         | File                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| TC-1 | `GET /api/healthz-smoke-812788042-a` returns `{ ok: true, variant: "812788042" }` when the handler is invoked directly with a real `H3Event` | `routes/api/healthz-smoke-812788042-a.test.ts` |

Single case, no wall-clock timing assertion — matches the pinned `healthz-smoke-528856326-a` shape, not the 47 legacy probes that carry a `responds in under 100ms` case.

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-812788042-a.test.ts` (run before `routes/api/healthz-smoke-812788042-a.ts` existed)

```
FAIL  |server| routes/api/healthz-smoke-812788042-a.test.ts [ routes/api/healthz-smoke-812788042-a.test.ts ]
Error: Cannot find module './healthz-smoke-812788042-a' imported from /workspace/repo/routes/api/healthz-smoke-812788042-a.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

Command: `bun --bun vitest run routes/api/healthz-smoke-812788042-a.test.ts` (after adding the handler)

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate — `bun run verify` (lint + `tsc --build` + `NODE_ENV=test bun --bun vitest run`, the whole unit tier, not just this file):

```
 Test Files  129 passed (129)
      Tests  189 passed (189)
```

Exit code: 0.

## Additional verification (per PLAN.md steps 4–5)

- `bun run dev` → bound `:5002` (banner: `Port 5000 is in use`, `Port 5001 is in use`).
  `curl -s -o /tmp/body.json -w '%{http_code} %{content_type}\n' http://localhost:5002/api/healthz-smoke-812788042-a`
  → `200 application/json;charset=UTF-8` — body `{"ok":true,"variant":"812788042"}`.
- Second request with a query string and an extra header (`?foo=bar`, `X-Test: 1`) produced a byte-identical body (`diff` empty).
- `bun run build` → exit 0. `.output/server/_routes/api/healthz_smoke_812788042_a.mjs` exists; no `.test.ts` file present under `.output/`.

TDD-RESULT: 189 passed, 0 failed
