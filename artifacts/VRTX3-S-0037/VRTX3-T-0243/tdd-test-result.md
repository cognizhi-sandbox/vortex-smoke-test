# TDD Test Results — VRTX3-T-0243

**Ticket**: VRTX3-T-0243
**Endpoint**: `/api/healthz-smoke-bugfix-147016547`
**Date**: 2026-08-23

---

## Test cases

- **`returns HTTP 200 with correct response body`** — constructs
  `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-147016547"))`, invokes the
  default-exported handler, asserts `toEqual({ ok: true, variant: "147016547" })`.

Copied from `routes/api/healthz-smoke-528856326-a.test.ts` per the pinned pointer in `AGENTS.md` §
Health Probe Routes — the single-assertion shape, not the 47-of-115 legacy shape that carries a
second `responds in under 100ms` case. No elapsed-time assertion is present.

---

## Red run

**State**: test file created before the handler existed.
**Command**: `bun run test routes/api/healthz-smoke-bugfix-147016547.test.ts`

```
 ❯ |server| routes/api/healthz-smoke-bugfix-147016547.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix-147016547.test.ts [ routes/api/healthz-smoke-bugfix-147016547.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix-147016547' imported from /workspace/repo/routes/api/healthz-smoke-bugfix-147016547.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

**Status**: FAILED (expected — RED)

---

## Green run

**State**: handler created with the fixed-contract implementation.
**Command**: `bun run test routes/api/healthz-smoke-bugfix-147016547.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**Status**: PASSED

Full-suite run (`bun run verify` = lint + typecheck + unit):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   → 0 warnings
$ tsc --build                                                                  → success
$ NODE_ENV=test bun --bun vitest run
 Test Files  123 passed (123)
      Tests  183 passed (183)
```

Build (`bun run build`) produced `.output/server/_routes/api/healthz_smoke_bugfix_147016547.mjs`;
no module built from the `.test.ts` file.

Live check against `bun run dev` (Vite bound `:5002` — `5000` and `5001` were in use):

```
$ curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}\n' http://localhost:5002/api/healthz-smoke-bugfix-147016547
200 application/json;charset=UTF-8 34
$ curl -s http://localhost:5002/api/healthz-smoke-bugfix-147016547
{"ok":true,"variant":"147016547"}
```

Before the fix, the same path answered `200 text/html; charset=utf-8` (949 B, the SPA shell).
Control route (`/api/healthz-smoke-528856326-a`) confirmed `200 application/json;charset=UTF-8`
with its own body in the same session.

---

TDD-RESULT: 1 passed, 0 failed
