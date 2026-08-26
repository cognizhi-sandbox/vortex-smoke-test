---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0046
ticket: VRTX3-T-0307
branch: vortex/fix/VRTX3-T-0307-smoke-bugfix-178771464562768-api-healthz-ca5bf72c
upstream: [artifacts/VRTX3-S-0046/VRTX3-T-0307/PLAN.md]
---

# TDD result — VRTX3-T-0307

## Test cases

| Test                                                                                                                                        | Covers     | Intent                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `routes/api/healthz-smoke-bugfix-769466328.test.ts › GET /api/healthz-smoke-bugfix-769466328 › returns HTTP 200 with correct response body` | AC-1, AC-4 | handler returns the exact fixed body `{ ok: true, variant: "769466328" }` with no extra keys |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-bugfix-769466328.test.ts` — run before the handler
file existed:

```
FAIL  |server| routes/api/healthz-smoke-bugfix-769466328.test.ts [ routes/api/healthz-smoke-bugfix-769466328.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix-769466328' imported from
/workspace/repo/routes/api/healthz-smoke-bugfix-769466328.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` _(this stack's full gate — `lint && typecheck && test`, per `AGENTS.md` §
Bundled gates)_:

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  150 passed (150)
      Tests  210 passed (210)
```

Additionally verified live against `bun run dev` (Vite bound `:5005`; banner-reported, per
`design.md` § D1 — status code alone cannot distinguish a wired route):

```
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5005/api/healthz-smoke-bugfix-769466328
200 application/json;charset=UTF-8
$ curl -s http://localhost:5005/api/healthz-smoke-bugfix-769466328
{"ok":true,"variant":"769466328"}
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5005/api/healthz-smoke-nonexistent-999
200 text/html; charset=utf-8
```

Two successive requests (differing query string and headers) returned byte-identical bodies
(`diff` empty). `bun run build` was also run: `.output/server/_routes/api/healthz_smoke_bugfix_769466328.mjs`
exists in the compiled output, and no `.test.ts` file is present under `.output/`.

TDD-RESULT: 210 passed, 0 failed
