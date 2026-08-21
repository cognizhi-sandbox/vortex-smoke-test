---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0003
idea: VRTX3-I-0006
branch: vortex/sprint/vrtx3-s-0003-36924a4a
downstream:
  - artifacts/VRTX3-S-0003/VRTX3-T-0013/PLAN.md
  - artifacts/VRTX3-S-0003/VRTX3-T-0014/PLAN.md
  - artifacts/VRTX3-S-0003/VRTX3-T-0015/PLAN.md
---

> **This sprint key is being reused.** A different sprint also ran as `VRTX3-S-0003` on 2026-08-02
> (variants `26031336` / `59156521` / `200192357`) with the same three ticket keys, and its
> artifacts are still on disk here. This `SPRINT-PLAN.md` and the three `PLAN.md` files were
> overwritten and are current. Everything else in `artifacts/VRTX3-S-0003/` —
> `integration-test-result.md`, `qa-test-report.md`, `release-notes.md`, `sprint-summary.md`, and
> each ticket directory's `fix-note.md` / `tdd-test-result.md` — belongs to that earlier sprint and
> reports **completed** fixes for endpoints this sprint is not touching. Deleting another sprint's
> record is out of scope. Read the plans, not the directory listing.

# Sprint plan — VRTX3-S-0003

## Goal

Restore three health probes reported as unreachable, so each answers `Content-Type:
application/json` with `{"ok":true,"variant":"<id>"}` (VRTX3-I-0006). Purely additive: 6 new files
under `routes/api/`, 0 existing source files modified.

## Defects

| Ticket       | Endpoint                               | Root cause                                                                 | Plan                                             |
| ------------ | -------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| VRTX3-T-0013 | `/api/healthz-smoke-bugfix-858873211`  | Handler file never written; grep for `858873211` returns zero repo matches | [`VRTX3-T-0013/PLAN.md`](./VRTX3-T-0013/PLAN.md) |
| VRTX3-T-0014 | `/api/healthz-smoke-bugfix2-664793322` | Handler file never written; grep for `664793322` returns zero repo matches | [`VRTX3-T-0014/PLAN.md`](./VRTX3-T-0014/PLAN.md) |
| VRTX3-T-0015 | `/api/healthz-smoke-bugfix3-267063007` | Handler file never written; grep for `267063007` returns zero repo matches | [`VRTX3-T-0015/PLAN.md`](./VRTX3-T-0015/PLAN.md) |

## Cross-cutting notes

- **No shared files, no ordering.** Each defect owns exactly two new files and nothing else, so the
  three ownership maps are disjoint and no `depends_on` edge is set. Build and merge them in any
  order, in parallel.
- **All three reported a `404`; all three actually return the SPA shell.** Re-measured live during
  planning on a dev server at `:5000` — each target path returned `200 text/html; charset=utf-8`
  (949 B), while the control `/api/healthz-smoke-528856326-a` returned
  `200 application/json;charset=UTF-8` (33 B). Twenty-third consecutive confirmation. Assert on the
  **body and `Content-Type`**; a `404 → 200` check passes whether or not the route exists.
- **Copy `routes/api/healthz-smoke-528856326-a.{ts,test.ts}`.** VRTX3-I-0006 names
  `healthz-smoke-bugfix3-834560860.test.ts` instead. Diffed during planning: shape-identical to the
  pinned pair (single body assertion, no timing case), so the substitution costs nothing this time —
  the third recorded near-miss, and the second harmless one. Substitute anyway; 47 of the 103 probe
  tests still carry the flaky `expect(elapsed).toBeLessThan(100)` case.
- **Root docs are already done.** `AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md` were updated on
  this planning ticket — probe-family count 103 → 106, re-counted from the filesystem. No fix ticket
  touches a root doc. `DESIGN.md` is unchanged; nothing visual moves.
- **No test-harness or CI phase.** `nitro({ serverDir: "./" })` registers a new `routes/api/*.ts` by
  filename with no registration step, the Vitest `server` project collects `routes/**/*.test.ts`
  with no configuration, and `.github/workflows/ci.yml` already triggers on `push` and
  `pull_request` to `vortex/**`.

## Risks & assumptions

- **The filename is the contract.** A typo in a variant id ships a route that is unreachable while
  its unit test still passes green — the test imports the handler module directly and never
  exercises routing. Each plan's DoD-3 is a live request for exactly this reason.
- _Assumption:_ the three probes are wanted under `/api/`, like all 103 siblings. The ticket titles
  write the paths with the prefix, so there is nothing to reconcile here.
- **VRTX3-I-0006's fix shape is correct and was verified against the code**; only its `404` claim
  failed re-verification (see VRTX3-T-0015's plan). Its `## Fix Acceptance Criteria` also names
  build/test commands — those are the implementation agent's to choose, so the ticket criteria state
  the outcome instead.

## Follow-ups / out of scope

- **No distinct new defect was found.** The three committed tickets cover everything root-causing
  surfaced.
- **`routes/api/` holds 209 files, nearly all one-off probes.** VRTX3-I-0006 raises directory growth
  as worth cleaning up separately. It is not a defect and not this sprint's work; the duplication is
  a deliberate, documented decision (`ARCHITECTURE.md` § Key Decisions). Recorded here only so the
  observation is not lost.
- **Recycled keys leave stale per-ticket artifacts on disk** (see the banner above). Each stale
  `fix-note.md` reads as "already fixed" to anyone who opens the directory rather than the plan. A
  convention for retiring or namespacing superseded sprint artifacts would remove the hazard; this
  is the second sprint in a row to hit it (VRTX3-S-0002 was the first).
