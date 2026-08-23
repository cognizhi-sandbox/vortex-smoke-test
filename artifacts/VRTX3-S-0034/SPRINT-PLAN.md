---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0034
idea: VRTX3-I-0041
branch: vortex/sprint/vrtx3-s-0034-96262b30
downstream:
  - artifacts/VRTX3-S-0034/VRTX3-T-0221/PLAN.md
  - artifacts/VRTX3-S-0034/VRTX3-T-0222/PLAN.md
  - artifacts/VRTX3-S-0034/VRTX3-T-0223/PLAN.md
---

# Sprint plan — VRTX3-S-0034

## Goal

Restore three health probes reported as unreachable, so each answers `Content-Type:
application/json` with `{"ok":true,"variant":"<id>"}`. Purely additive: 6 new files under
`routes/api/`, 0 existing source files modified.

## Defects

| Ticket       | Endpoint                               | Root cause                                                                 | Plan                                             |
| ------------ | -------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| VRTX3-T-0221 | `/api/healthz-smoke-bugfix-839771954`  | Handler file never written; grep for `839771954` returns zero repo matches | [`VRTX3-T-0221/PLAN.md`](./VRTX3-T-0221/PLAN.md) |
| VRTX3-T-0222 | `/api/healthz-smoke-bugfix2-554747562` | Handler file never written; grep for `554747562` returns zero repo matches | [`VRTX3-T-0222/PLAN.md`](./VRTX3-T-0222/PLAN.md) |
| VRTX3-T-0223 | `/api/healthz-smoke-bugfix3-238311955` | Handler file never written; grep for `238311955` returns zero repo matches | [`VRTX3-T-0223/PLAN.md`](./VRTX3-T-0223/PLAN.md) |

## Cross-cutting notes

- **No shared files, no ordering.** Each defect owns exactly two new files, so the three ownership
  maps are disjoint and no `depends_on` edge is set. Build and merge them in any order, in parallel.
- **All three reported a `404`; all three actually return the SPA shell.** Re-measured live during
  planning on a dev server at `:5000` — each target path returned `200 text/html; charset=utf-8`
  (949 B), while the control `/api/healthz-smoke-528856326-a` returned
  `200 application/json;charset=UTF-8` (33 B). Twenty-fourth consecutive confirmation. Assert on the
  **body and `Content-Type`**; a `404 → 200` check passes whether or not the route exists.
- **Copy `routes/api/healthz-smoke-528856326-a.{ts,test.ts}`.** VRTX3-I-0041 names
  `healthz-smoke-bugfix3-993514120.ts` and its test instead. Diffed during planning: that test
  **does** carry the flaky `expect(elapsed).toBeLessThan(100)` case, so this is the harmful form of
  the drift — the second recorded instance after VRTX3-I-0037, against three harmless ones.
  Substitute the pinned pair; 47 of the 106 probe tests still carry the timing case.
- **VRTX3-I-0041's AC-4 demands a sub-100ms assertion. It is dropped, deliberately.** The outcome it
  reaches for — the handler performs no I/O — is guaranteed by the interface contract each plan
  fixes (sole import `nitro/h3`, no `db/`, no `event.context` read), not by a wall-clock check on a
  shared CI runner. See `AGENTS.md` § Health Probe Routes.
- **Root docs are already done.** `AGENTS.md`, `ARCHITECTURE.md` and `PRODUCT.md` were updated on
  this planning ticket — probe-family count 106 → 109, re-counted from the filesystem. No fix ticket
  touches a root doc. `DESIGN.md` changes only a dead cross-reference (below); nothing visual moves.
- **No test-harness or CI phase.** `nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`
  (`vite.config.ts:29`) registers a new `routes/api/*.ts` by filename with no registration step, the
  Vitest `server` project collects `routes/**/*.test.ts` with no configuration, and CI already
  triggers on `push` and `pull_request` to `vortex/**`.

## Risks & assumptions

- **The filename is the contract.** A typo in a variant id ships a route that is unreachable while
  its unit test still passes green — the test imports the handler module directly and never
  exercises routing. Each plan's DoD-3 is a live request for exactly this reason.
- _Assumption:_ the three probes are wanted under `/api/`, like all 106 siblings. The ticket titles
  write the paths with the prefix, so there is nothing to reconcile.
- **VRTX3-I-0041's evidence and fix shape are correct and were verified against the code**; its
  `404` claim, its copy-source pointer and its AC-4 all failed re-verification (see above). Its
  `## Fix Acceptance Criteria` also names a build/test command — that is the implementation agent's
  to choose, so the ticket criteria state the outcome instead.
- Only VRTX3-T-0223 has an idea behind it; VRTX3-T-0221 and VRTX3-T-0222 have no canvas and assert
  `404` unchecked. The fifth sprint to hit this uneven-capture split — it is why every path is
  measured rather than reasoned about.

## Follow-ups / out of scope

- **No distinct new defect was found.** The three committed tickets cover everything root-causing
  surfaced.
- **`AGENT.md` → `AGENTS.md` left 19 dead cross-references** across the four root docs. The manual
  was consolidated and renamed in `600b74f`; every `[AGENT.md](./AGENT.md#…)` link written before it
  now points at a file that does not exist (AGENTS.md 6, ARCHITECTURE.md 9, PRODUCT.md 3,
  DESIGN.md 1). Root docs are planning-owned and cannot be delegated to a fix ticket, so this was
  repaired on this planning ticket rather than deferred — a path-only rewrite, no prose changed.
  Recorded here because it is a real defect this sprint did not cause.
- **`README.md:457` carries a twentieth dead `./AGENT.md` link — still open.** `README.md` is not a
  planning-owned root doc, and planning has no DEFECT-creation authority, so it was left untouched
  rather than swept in with the four above. One line; a future sprint should fold it into any ticket
  already editing `README.md`.
- **`routes/api/` holds 215 files, nearly all one-off probes.** Directory growth is not a defect and
  not this sprint's work; the duplication is a deliberate, documented decision (`ARCHITECTURE.md`
  § Key Decisions). Recorded only so the observation is not lost.
