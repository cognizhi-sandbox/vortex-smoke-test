---
artifact: tdd-test-result
spec: 1
status: complete
author_role: implementation
sprint: VRTX3-S-0039
ticket: VRTX3-T-0262
branch: vortex/feat/VRTX3-T-0262-probe-c-get-api-healthz-smoke-812788042-98c8161d
---

# TDD result — VRTX3-T-0262: `GET /api/healthz-smoke-812788042-c`

## Test cases

| ID   | Case                                                                                                                             | AC               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| TC-1 | `defineHandler`'s default export, invoked with an `H3Event` for the probe path, resolves to `{ ok: true, variant: "812788042" }` | AC-1, AC-3, AC-4 |

One case, matching the pinned template `healthz-smoke-528856326-a.test.ts` — no wall-clock
assertion added (see PLAN.md's "Copy source" section).

## Red run

Before `routes/api/healthz-smoke-812788042-c.ts` existed:

```
$ bun --bun vitest run routes/api/healthz-smoke-812788042-c.test.ts
 FAIL  |server| routes/api/healthz-smoke-812788042-c.test.ts
Error: Cannot find module './healthz-smoke-812788042-c' imported from
  /workspace/repo/routes/api/healthz-smoke-812788042-c.test.ts
 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

After creating the handler, full core gate:

```
$ bun run verify
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  129 passed (129)
      Tests  189 passed (189)
```

Targeted file also confirmed independently:

```
$ bun --bun vitest run routes/api/healthz-smoke-812788042-c.test.ts
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

## Additional verification (AC-1, AC-2, AC-5)

- `bun run build` → `.output/server/_routes/api/healthz_smoke_812788042_c.mjs` present; no
  `.test.ts` file bundled under `.output/`.
- `bun run dev` (bound `:5001`, `:5000` was in use) →
  `GET /api/healthz-smoke-812788042-c` → `200 application/json;charset=UTF-8`,
  body `{"ok":true,"variant":"812788042"}`.
- A second request to the same path with a different query string, an added header, and a
  body produced byte-identical response bytes (`diff` empty).

TDD-RESULT: 189 passed, 0 failed
