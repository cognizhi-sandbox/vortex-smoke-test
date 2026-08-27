---
ticket: VRTX3-T-0318
sprint: VRTX3-S-0047
---

# TDD result — VRTX3-T-0318

## Test cases

`routes/api/healthz-smoke-436511294-c.test.ts`:

1. `GET /api/healthz-smoke-436511294-c > returns HTTP 200 with correct response body` — builds an
   `H3Event` for `http://localhost/api/healthz-smoke-436511294-c`, invokes the module's default
   export, and asserts the result deep-equals `{ ok: true, variant: "436511294" }`. No wall-clock
   assertion (per `design.md` § D2).

## Red run

Command: `bun --bun vitest run routes/api/healthz-smoke-436511294-c.test.ts`

Before the handler file existed, the test failed as expected:

```
FAIL  |server| routes/api/healthz-smoke-436511294-c.test.ts [ routes/api/healthz-smoke-436511294-c.test.ts ]
Error: Cannot find module './healthz-smoke-436511294-c' imported from /workspace/repo/routes/api/healthz-smoke-436511294-c.test.ts

 Test Files  1 failed (1)
      Tests  no tests
```

## Green run

After adding `routes/api/healthz-smoke-436511294-c.ts` (copied from the pinned
`healthz-smoke-528856326-a` pair, variant string changed only):

Command: `bun --bun vitest run routes/api/healthz-smoke-436511294-c.test.ts`

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

Full pre-commit gate, command: `bun run verify` (= `bun run lint && bun run typecheck && bun run test`)

```
 Test Files  153 passed (153)
      Tests  213 passed (213)
```

### Additional AC verification (live route + build output)

- Live server (`bun run dev`, port `5000` per Vite banner):
  - `GET /api/healthz-smoke-436511294-c` → `200 application/json;charset=UTF-8`
    `{"ok":true,"variant":"436511294"}`
  - Same path with a different query string and an added header → byte-identical body (AC-2)
  - `POST /api/healthz-smoke-436511294-c` with a body → same `200` JSON body (existing
    family-wide no-method-guard behaviour, unchanged)
- Production build (`bun run build`): `.output/server/_routes/api/healthz_smoke_436511294_c.mjs`
  exists; no `.test.` file present under `.output/server/`.

TDD-RESULT: 213 passed, 0 failed
