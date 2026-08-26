# TDD Test Results — VRTX3-T-0296

**Ticket**: VRTX3-T-0296
**Endpoint**: `/api/healthz-smoke-bugfix2-369920394`
**Date**: 2026-08-26

---

## Test cases

- **`returns HTTP 200 with correct response body`** — constructs
  `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix2-369920394"))`, invokes the
  default-exported handler, asserts `toEqual({ ok: true, variant: "369920394" })`.

Copied from `routes/api/healthz-smoke-528856326-a.test.ts` per the pinned pointer in `AGENTS.md` §
Health Probe Routes and `design.md` § D3 — the single-assertion shape, not the 47-of-133 legacy
shape that carries a second `responds in under 100ms` case. No elapsed-time assertion is present.

---

## Red run

**State**: test file created before the handler existed.
**Command**: `bun --bun vitest run routes/api/healthz-smoke-bugfix2-369920394.test.ts`

```
 ❯ |server| routes/api/healthz-smoke-bugfix2-369920394.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix2-369920394.test.ts [ routes/api/healthz-smoke-bugfix2-369920394.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix2-369920394' imported from /workspace/repo/routes/api/healthz-smoke-bugfix2-369920394.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

**Status**: FAILED (expected — RED)

---

## Green run

**State**: handler created with the fixed-contract implementation.
**Command**: `bun --bun vitest run routes/api/healthz-smoke-bugfix2-369920394.test.ts`

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
 Test Files  144 passed (144)
      Tests  204 passed (204)
```

Live check against `bun run dev` (Vite bound `:5003` — `:5000`-`:5002` were in use):

```
$ curl -s -o /tmp/body_probe.txt -w '%{http_code} %{content_type}\n' http://localhost:5003/api/healthz-smoke-bugfix2-369920394
200 application/json;charset=UTF-8
$ cat /tmp/body_probe.txt
{"ok":true,"variant":"369920394"}
```

Before the fix, the same path answered `200 text/html; charset=utf-8` (949 B, the SPA shell).

Unrouted-path control, same run, distinguishable only by body/content-type (AC-2):

```
$ curl -s -o /tmp/body_control.txt -w '%{http_code} %{content_type}\n' http://localhost:5003/api/healthz-smoke-bugfix2-369920394-nonexistent
200 text/html; charset=utf-8
```

Repeat-call check (AC-3) — second request with a different query string and an extra header
returns byte-identical JSON:

```
$ curl -s -H "X-Test: 1" "http://localhost:5003/api/healthz-smoke-bugfix2-369920394?foo=bar" -o /tmp/body_probe2.txt
$ diff /tmp/body_probe.txt /tmp/body_probe2.txt && echo IDENTICAL
IDENTICAL
```

Production build output check (AC-6) — `bun run build`, then:

```
$ ls .output/server/_routes/api/ | grep 369920394
healthz_smoke_bugfix2_369920394.mjs
$ find .output -iname "*.test.*"
(no output — zero matches)
```

---

TDD-RESULT: 1 passed, 0 failed
