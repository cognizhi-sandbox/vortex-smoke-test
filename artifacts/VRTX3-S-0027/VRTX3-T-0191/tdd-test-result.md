---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0027
ticket: VRTX3-T-0191
branch: vortex/feat/VRTX3-T-0191-get-api-healthz-smoke-868033827-c-84927f8d
upstream: [artifacts/VRTX3-S-0027/VRTX3-T-0191/PLAN.md]
---

# TDD result — VRTX3-T-0191

## Test cases

| Test                                                                                         | Covers     | Intent                                                                           |
| -------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-868033827-c.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3 | handler returns `{ ok: true, variant: "868033827" }` for a constructed `H3Event` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-868033827-c.test.ts` — handler did not exist yet:

```
FAIL  |server| routes/api/healthz-smoke-868033827-c.test.ts [ routes/api/healthz-smoke-868033827-c.test.ts ]
Error: Cannot find module './healthz-smoke-868033827-c' imported from /workspace/repo/routes/api/healthz-smoke-868033827-c.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

`bun run verify` — the project's full pre-commit gate (`lint && typecheck && test`):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  97 passed (97)
      Tests  157 passed (157)
```

Additional live-wiring evidence (not part of the gate, but required by AC-2): with `bun run dev`
bound to `http://localhost:5000` (per the Vite banner), `curl -s -D - http://localhost:5000/api/healthz-smoke-868033827-c`
returned `HTTP/1.1 200 OK`, `content-type: application/json;charset=UTF-8`, body
`{"ok":true,"variant":"868033827"}` — matching the control `/api/healthz-smoke-528856326-a` byte
for byte apart from the variant. `bun run build` then emitted
`.output/server/_routes/api/healthz_smoke_868033827_c.mjs`, and `find .output -name "*.test.ts"`
returned zero matches.

TDD-RESULT: 157 passed, 0 failed
