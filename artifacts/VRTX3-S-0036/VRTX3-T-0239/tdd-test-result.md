---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0036
ticket: VRTX3-T-0239
---

# TDD Result — VRTX3-T-0239: GET /api/healthz-smoke-450228657-b

## Test cases

| #   | Case                                                                                                                                                 | File                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Handler returns `{ ok: true, variant: "450228657" }` for a direct call with an `H3Event` built from `http://localhost/api/healthz-smoke-450228657-b` | `routes/api/healthz-smoke-450228657-b.test.ts` |

One case, one assertion — matching the pinned `528856326-a` shape. No wall-clock case, per `AGENTS.md § Health Probe Routes`.

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-450228657-b.test.ts`, run before `routes/api/healthz-smoke-450228657-b.ts` existed.

```
FAIL  |server| routes/api/healthz-smoke-450228657-b.test.ts [ routes/api/healthz-smoke-450228657-b.test.ts ]
Error: Cannot find module './healthz-smoke-450228657-b' imported from /workspace/repo/routes/api/healthz-smoke-450228657-b.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

Command (full pre-commit gate, per `AGENTS.md`): `bun run verify` (= `bun run lint && bun run typecheck && bun run test`)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  120 passed (120)
      Tests  180 passed (180)
```

Also verified separately:

- Production build: `bun run build` — exit 0, emits `.output/server/_routes/api/healthz_smoke_450228657_b.mjs`, zero `*.test.*` files under `.output/server`.
- Live request against the running dev server (port `:5000`, read from the Vite banner): `curl -s -o /tmp/body.json -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-450228657-b` → `200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"450228657"}`. Control `/api/healthz-smoke-528856326-a` → `200 application/json;charset=UTF-8`.

TDD-RESULT: 180 passed, 0 failed
