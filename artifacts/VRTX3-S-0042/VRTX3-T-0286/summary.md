---
ticket: VRTX3-T-0286
type: task
---

# Summary — VRTX3-T-0286

Added health probe `GET /api/healthz-smoke-613529736-c`: one Nitro handler plus its colocated unit
test, copied from the pinned `healthz-smoke-528856326-a` source per
`openspec/changes/vrtx3-i-0051-.../design.md` § D2. No wall-clock assertion added. No root doc
touched (§ D3 — the AC-8 instruction to edit a probe-count line is stale; no such line exists).

## Files touched

- `routes/api/healthz-smoke-613529736-c.ts` (new) — handler returning `{ ok: true, variant: "613529736" }`
- `routes/api/healthz-smoke-613529736-c.test.ts` (new) — asserts the handler's returned object

## Acceptance criteria

- AC-1 (fixed 200/JSON body) — verified live: `curl http://localhost:5000/api/healthz-smoke-613529736-c` → `200 application/json;charset=UTF-8 {"ok":true,"variant":"613529736"}`
- AC-2 (byte-identical repeat calls) — handler is a pure constant return, no request-derived state
- AC-3 (only import is `defineHandler` from `nitro/h3`) — verified by inspection of the file
- AC-4 (colocated test asserts returned object, no timing case) — see test file
- AC-5 (compiles into production server) — `bun run build` emits `.output/server/_routes/api/healthz_smoke_613529736_c.mjs`; no `.test.ts`-built module present

## Verification commands

- `bun run test -- routes/api/healthz-smoke-613529736-c.test.ts` — red then green (see tdd-test-result.md)
- `bun run verify` — 138 test files / 198 tests passed, lint + typecheck clean
- `bun run build` — production build succeeds, route module present
