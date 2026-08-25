---
ticket: VRTX3-T-0285
change: vrtx3-i-0051-smoke-178768361938065-3-independent-endpoints-61
---

# TDD result — VRTX3-T-0285

## Test cases

| #   | Case                                                                                                                         | File                                           | Maps to AC |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------- |
| 1   | `GET /api/healthz-smoke-613529736-b` handler returns `{ ok: true, variant: "613529736" }` when invoked with a real `H3Event` | `routes/api/healthz-smoke-613529736-b.test.ts` | AC-1, AC-4 |

Single body assertion, no wall-clock timing case — per `AGENTS.md` § Health Probe Routes and
design.md § D2 (pinned `528856326` copy source).

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-613529736-b.test.ts`

Test file was created first, importing the not-yet-existing handler module:

```
FAIL  |server| routes/api/healthz-smoke-613529736-b.test.ts [ routes/api/healthz-smoke-613529736-b.test.ts ]
Error: Cannot find module './healthz-smoke-613529736-b' imported from /workspace/repo/routes/api/healthz-smoke-613529736-b.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

Confirmed RED: the test failed because the handler did not exist yet.

## Green run

Handler `routes/api/healthz-smoke-613529736-b.ts` was added (copied from the pinned
`healthz-smoke-528856326-a.ts`, variant string changed to `"613529736"`).

Command: `bun --bun vitest run routes/api/healthz-smoke-613529736-b.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full core gate, command: `bun run verify` (lint + typecheck + full unit suite):

```
$ eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0
$ tsc --build
$ NODE_ENV=test bun --bun vitest run

 Test Files  138 passed (138)
      Tests  198 passed (198)
```

Exit code: 0. No new failures; zero pre-existing failures affected.

Additional wiring checks (PLAN.md steps 5-6), not part of the unit tier but run and recorded here:

- Live dev server (`bun run dev`, bound `:5001` per the Vite banner):
  `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:5001/api/healthz-smoke-613529736-b`
  → `200 application/json;charset=UTF-8`, body `{"ok":true,"variant":"613529736"}`.
  A second request varying query string, headers and body returned byte-identical bytes (`diff` empty).
- Production build (`bun run build`): `.output/server/_routes/api/healthz_smoke_613529736_b.mjs`
  exists; `find .output/server -iname "*test*"` returned nothing.

TDD-RESULT: 198 passed, 0 failed
