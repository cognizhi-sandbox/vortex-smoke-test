---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0037
idea: VRTX3-I-0044
branch: vortex/sprint/vrtx3-s-0037-3cd6b387
downstream:
  - artifacts/VRTX3-S-0037/VRTX3-T-0243/PLAN.md
  - artifacts/VRTX3-S-0037/VRTX3-T-0244/PLAN.md
  - artifacts/VRTX3-S-0037/VRTX3-T-0245/PLAN.md
---

# Sprint plan — VRTX3-S-0037

## Goal

Restore three health probes reported as unreachable, so each answers `Content-Type:
application/json` with `{"ok":true,"variant":"<id>"}`. Purely additive: 6 new files under
`routes/api/`, 0 existing source files modified.

## Defects

| Ticket       | Endpoint                                | Root cause                                                                  | Plan                                             |
| ------------ | --------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| VRTX3-T-0243 | `/api/healthz-smoke-bugfix-147016547`   | Handler file never written; grep for `147016547` returns zero repo matches  | [`VRTX3-T-0243/PLAN.md`](./VRTX3-T-0243/PLAN.md) |
| VRTX3-T-0244 | `/api/healthz-smoke-bugfix2-386341015`  | Handler file never written; grep for `386341015` returns zero repo matches  | [`VRTX3-T-0244/PLAN.md`](./VRTX3-T-0244/PLAN.md) |
| VRTX3-T-0245 | `/api/healthz-smoke-bugfix3-1025161533` | Handler file never written; grep for `1025161533` returns zero repo matches | [`VRTX3-T-0245/PLAN.md`](./VRTX3-T-0245/PLAN.md) |

## Cross-cutting notes

- **No shared files, no ordering.** Each defect owns exactly two new files, so the three ownership
  maps are disjoint and no `depends_on` edge is set. Build and merge them in any order, in parallel.
- **All three reported a `404`; all three actually return the SPA shell.** Re-measured live during
  planning on a dev server at `:5002` — each target path returned `200 text/html; charset=utf-8`
  (949 B), while the control `/api/healthz-smoke-528856326-a` returned
  `200 application/json;charset=UTF-8` (33 B). Twenty-seventh consecutive confirmation. Assert on the
  **body and `Content-Type`**; a `404 → 200` check passes whether or not the route exists.
- **Read your own dev-server port from the Vite banner.** Planning got `:5002` — `:5000` and `:5001`
  were both already bound in this container. The port is per-container, so this sprint's number is
  not yours to reuse; VRTX3-S-0036 saw two different ports across its own runs.
- **Copy `routes/api/healthz-smoke-528856326-a.{ts,test.ts}`.** VRTX3-I-0044 names the pinned pair
  itself and is correct — see the note below. 47 of the 115 probe tests carry a flaky
  `expect(elapsed).toBeLessThan(100)` case; the pinned pair does not. Do not sample a directory
  neighbour.
- **VRTX3-I-0044 is the first canvas in this family to name the pinned pair _and_ correctly identify
  a legacy neighbour by name.** It quotes `healthz-smoke-bugfix3-196651982.ts` as a shape example
  (the handler — harmless, handlers carry no timing case) while explicitly warning that its _test_ is
  one of the 47 legacy files and must not be copied. Diffed during planning: that test does carry
  the wall-clock case, so the warning is accurate. Nothing to substitute on VRTX3-T-0245.
- **VRTX3-I-0044's AC-8 (probe-count doc updates) is dropped from every fix ticket.** The three root
  docs carrying the count are planning-owned and were updated on this planning ticket — count
  115 → 118, re-derived from the filesystem. No fix ticket may touch `AGENTS.md`,
  `ARCHITECTURE.md`, `PRODUCT.md` or `DESIGN.md`.
- **VRTX3-I-0044's ACs name build and verify commands; those are dropped too.** A ticket carries the
  outcome, not the command — each PLAN.md states the observable result and leaves the invocation to
  the implementing agent.
- **Do not factor the family into a shared handler, factory or barrel export.** The duplication is a
  deliberate decision (`ARCHITECTURE.md` § Key Decisions, "Health probes duplicate, on purpose").
  Consolidating would turn a 2-file addition into a 238-file edit.
- **A green unit test does not prove a route is wired.** The colocated test imports the handler
  module directly and passes whether or not Nitro registered the path. Only a live request, or the
  compiled module under `.output/server/_routes/api/`, proves the route exists.
- **Test-file baseline for this sprint: 122** files matching `^(src|routes).*\.test\.(ts|tsx)$` at
  planning, going to 125 once all three land.

## Design reference

_No design reference on this sprint._ VRTX3-I-0044's design manifest returned zero blocks, the other
two defects have no idea linked, and no user-visible surface changes.

## Follow-ups / out of scope

- **F1 — The `404` mis-transcription keeps arriving from defect capture.** Two of this sprint's three
  defects (VRTX3-T-0243, VRTX3-T-0244) have no idea canvas behind them and assert `404` unchecked;
  the third derived the fallback correctly from source but could measure nothing. This is the sixth
  recorded instance of that uneven-capture split. It originates upstream in defect capture, not in
  this repo, so it is not fixable here and no ticket is filed. Recorded so the next planner expects it.
- **F2 — 47 probe tests still carry the flaky wall-clock assertion.** Never rewritten, so the ratio
  dilutes (47 of 118 after this sprint) while the odds of a canvas sampling one stay near even. A
  sweep removing those 47 `it("responds in under 100ms")` blocks would retire the hazard, but it is a
  47-file edit against files that otherwise never change — out of scope for a bugfix sprint, and no
  ticket is filed. Left for a future maintenance sprint to weigh.
