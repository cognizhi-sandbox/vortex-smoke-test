---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0027
ticket: VRTX3-T-0189
branch: vortex/feat/VRTX3-T-0189-get-api-healthz-smoke-868033827-a-389a6a4b
upstream: [artifacts/VRTX3-S-0027/VRTX3-T-0189/PLAN.md]
---

# TDD result — VRTX3-T-0189

## Test cases

| Test                                                                                         | Covers           | Intent                                                                                                                   |
| -------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `routes/api/healthz-smoke-868033827-a.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-3, AC-4 | handler returns `{ ok: true, variant: "868033827" }` for a direct `H3Event` call, single assertion, no elapsed-time case |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-868033827-a.test.ts` (test written against the not-yet-created handler)

```
FAIL  |server| routes/api/healthz-smoke-868033827-a.test.ts [ routes/api/healthz-smoke-868033827-a.test.ts ]
Error: Cannot find module './healthz-smoke-868033827-a' imported from /workspace/repo/routes/api/healthz-smoke-868033827-a.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` (this stack's full gate — `lint && typecheck && test`)

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  97 passed (97)
      Tests  157 passed (157)
```

Additionally ran `bun run build` (production build, AC-8): succeeded, emitted
`.output/server/_routes/api/healthz_smoke_868033827_a.mjs`, no `*.test.ts` present in `.output/`.

Additionally verified live wiring (AC-2) against `bun run dev` (bound `:5000`):
`curl -s -o /tmp/body.json -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-868033827-a`
→ `200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"868033827"}` — matches the control
`/api/healthz-smoke-528856326-a`, not the 949-byte `text/html` SPA shell.

TDD-RESULT: 157 passed, 0 failed
