---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0048
ticket: VRTX3-T-0326
branch: vortex/feat/VRTX3-T-0326-api-healthz-smoke-956166896-c-probe-endp-a08b4ef9
upstream: [artifacts/VRTX3-S-0048/VRTX3-T-0326/PLAN.md]
---

# TDD result — VRTX3-T-0326

## Test cases

| Test                                                                                         | Covers     | Intent                                                              |
| -------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `routes/api/healthz-smoke-956166896-c.test.ts › returns HTTP 200 with correct response body` | AC-1, AC-4 | handler default export returns `{ ok: true, variant: "956166896" }` |

## Red run

`bun --bun vitest run routes/api/healthz-smoke-956166896-c.test.ts` — run before the handler file existed:

```
FAIL  |server| routes/api/healthz-smoke-956166896-c.test.ts
Error: Cannot find module './healthz-smoke-956166896-c' imported from
  /workspace/repo/routes/api/healthz-smoke-956166896-c.test.ts
Test Files  1 failed (1)
     Tests  no tests
```

## Green run

`bun run verify` (this stack's full pre-commit gate — lint, typecheck, complete unit suite):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
Test Files  156 passed (156)
     Tests  216 passed (216)
```

Additional evidence beyond the gate (per `PLAN.md` steps 3–4):

- Live server (`bun run dev`, port `:5000` from the Vite banner):
  `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5000/api/healthz-smoke-956166896-c`
  → `200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"956166896"}`.
- A second request with a differing query string, header and body returned byte-identical JSON
  (`diff` of the two response bodies was empty).
- `bun run build` → `.output/server/_routes/api/healthz_smoke_956166896_c.mjs` present;
  `find .output -iname "*.test.*"` returned no matches.

TDD-RESULT: 216 passed, 0 failed
