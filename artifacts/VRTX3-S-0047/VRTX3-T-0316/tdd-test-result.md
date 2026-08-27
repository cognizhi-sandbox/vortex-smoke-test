---
ticket: VRTX3-T-0316
sprint: VRTX3-S-0047
type: tdd-test-result
---

# TDD result — VRTX3-T-0316: /api/healthz-smoke-436511294-a

## Test cases

| #   | Case                                                                             | File                                           | Assertion                                                                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `GET /api/healthz-smoke-436511294-a` returns HTTP 200 with correct response body | `routes/api/healthz-smoke-436511294-a.test.ts` | Constructs an `H3Event` for the probe path, invokes the module's default export, `expect(result).toEqual({ ok: true, variant: "436511294" })`. One `it` block, no timing assertion — per `design.md` § D2/D3. |

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-436511294-a.test.ts`

Test file written first, importing the not-yet-existing handler module. Run failed as expected:

```
FAIL  |server| routes/api/healthz-smoke-436511294-a.test.ts [ routes/api/healthz-smoke-436511294-a.test.ts ]
Error: Cannot find module './healthz-smoke-436511294-a' imported from /workspace/repo/routes/api/healthz-smoke-436511294-a.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

Handler added at `routes/api/healthz-smoke-436511294-a.ts` (copied from the pinned
`routes/api/healthz-smoke-528856326-a.ts`, variant string only changed).

Command: `bun --bun vitest run routes/api/healthz-smoke-436511294-a.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate, `bun run verify` (lint + typecheck + full unit tier):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run
 Test Files  153 passed (153)
      Tests  213 passed (213)
```

Zero new failures; baseline test-file count was 152, now 153 (+1, this ticket's own file — the
sibling `-b`/`-c` probes are separate parallel tickets).

Additional live checks (not part of the unit tier, run against `bun run dev`, port `:5000` per
the Vite banner):

- `GET /api/healthz-smoke-436511294-a` → `200 application/json;charset=UTF-8`,
  body `{"ok":true,"variant":"436511294"}` (AC-1).
- Two successive requests differing in query string and headers returned byte-identical response
  bodies (`diff` confirmed no difference) (AC-2).
- `bun run build` produced `.output/server/_routes/api/healthz_smoke_436511294_a.mjs`; no
  `.test.ts` file present anywhere under `.output` (AC-5).

TDD-RESULT: 213 passed, 0 failed
