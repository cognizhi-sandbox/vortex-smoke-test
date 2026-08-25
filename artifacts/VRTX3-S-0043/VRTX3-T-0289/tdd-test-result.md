# TDD Test Results — VRTX3-T-0289

**Ticket**: VRTX3-T-0289
**Endpoint**: `/api/healthz-smoke-bugfix-507266122`
**Date**: 2026-08-25

---

## Test cases

- **`returns HTTP 200 with correct response body`** — constructs
  `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix-507266122"))`, invokes the
  default-exported handler, asserts `toEqual({ ok: true, variant: "507266122" })`.

Copied from `routes/api/healthz-smoke-528856326-a.test.ts` per the pinned pointer in `AGENTS.md` §
Health Probe Routes and PLAN.md — the single-assertion shape, not the 47-of-133 legacy shape that
carries a second `responds in under 100ms` case. No elapsed-time assertion is present.

---

## Red run

**State**: test file created before the handler existed.
**Command**: `bun --bun vitest run routes/api/healthz-smoke-bugfix-507266122.test.ts`

```
 ❯ |server| routes/api/healthz-smoke-bugfix-507266122.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix-507266122.test.ts [ routes/api/healthz-smoke-bugfix-507266122.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix-507266122' imported from /workspace/repo/routes/api/healthz-smoke-bugfix-507266122.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

**Status**: FAILED (expected — RED)

---

## Green run

**State**: handler created with the fixed-contract implementation.
**Command**: `bun --bun vitest run routes/api/healthz-smoke-bugfix-507266122.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**Status**: PASSED

Full-suite gate (`bun run verify` = lint + typecheck + unit):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   → 0 warnings
$ tsc --build                                                                  → success
$ NODE_ENV=test bun --bun vitest run
 Test Files  141 passed (141)
      Tests  201 passed (201)
```

Live check against `bun run dev` (Vite bound `:5002` — `:5000` and `:5001` were in use):

```
$ curl -s -o /tmp/body.json -w '%{http_code} %{content_type}\n' http://localhost:5002/api/healthz-smoke-bugfix-507266122
200 application/json;charset=UTF-8
$ cat /tmp/body.json
{"ok":true,"variant":"507266122"}
```

Before the fix, the same path answered `200 text/html; charset=utf-8` (949 B, the SPA shell).

---

TDD-RESULT: 1 passed, 0 failed
