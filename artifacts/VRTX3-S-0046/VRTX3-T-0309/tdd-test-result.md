# TDD Test Results — VRTX3-T-0309

**Ticket**: VRTX3-T-0309
**Endpoint**: `/api/healthz-smoke-bugfix3-238143877`
**Date**: 2026-08-26

---

## Test cases

- **`returns HTTP 200 with correct response body`** — constructs `new H3Event(new Request("http://localhost/api/healthz-smoke-bugfix3-238143877"))`, invokes the default-exported handler, asserts `toEqual({ ok: true, variant: "238143877" })`.

Copied from the pinned `routes/api/healthz-smoke-528856326-a.test.ts` shape per `design.md` § D2
(the single-assertion form, not the 47-legacy-file shape that carries a second `responds in under
100ms` case). No elapsed-time assertion is present.

---

## Red run

**State**: test file created (imports `./healthz-smoke-bugfix3-238143877`), handler not yet created.
**Command**: `bun --bun vitest run routes/api/healthz-smoke-bugfix3-238143877.test.ts`

```
 ❯ |server| routes/api/healthz-smoke-bugfix3-238143877.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |server| routes/api/healthz-smoke-bugfix3-238143877.test.ts [ routes/api/healthz-smoke-bugfix3-238143877.test.ts ]
Error: Cannot find module './healthz-smoke-bugfix3-238143877' imported from /workspace/repo/routes/api/healthz-smoke-bugfix3-238143877.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

**Status**: FAILED (expected — RED)

---

## Green run

**State**: handler created with the fixed-contract implementation (copied from
`routes/api/healthz-smoke-528856326-a.ts`, variant string changed to `"238143877"`).
**Command**: `bun --bun vitest run routes/api/healthz-smoke-bugfix3-238143877.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**Status**: PASSED

Full-suite run (`bun run verify` = lint && typecheck && test):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0   → 0 warnings
$ tsc --build                                                                  → success
$ NODE_ENV=test bun --bun vitest run
 Test Files  150 passed (150)
      Tests  210 passed (210)
```

Build (`bun run build`) produced `.output/server/_routes/api/healthz_smoke_bugfix3_238143877.mjs`;
no module built from the `.test.ts` file (confirmed via `find .output -iname "*.test.*"` → empty).

Live check against `bun run dev` (Vite bound `:5004` in this session — `:5000`–`:5003` were in use):

```
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5004/api/healthz-smoke-bugfix3-238143877
200 application/json;charset=UTF-8
$ curl -s http://localhost:5004/api/healthz-smoke-bugfix3-238143877
{"ok":true,"variant":"238143877"}
$ curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5004/api/healthz-smoke-nonexistent-xyz
200 text/html
```

Confirms AC-2 (unrouted path distinguishable only by body/Content-Type, both HTTP 200) and AC-3
(repeat calls with differing query string/headers return byte-identical JSON, guaranteed
structurally by the handler taking no input).

---

TDD-RESULT: 1 passed, 0 failed
