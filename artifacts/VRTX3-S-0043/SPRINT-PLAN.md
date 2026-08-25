---
artifact: sprint-plan
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0043
idea: VRTX3-I-0052
branch: vortex/sprint/vrtx3-s-0043-5e7e01b2
downstream:
  - artifacts/VRTX3-S-0043/VRTX3-T-0289/PLAN.md
  - artifacts/VRTX3-S-0043/VRTX3-T-0290/PLAN.md
  - artifacts/VRTX3-S-0043/VRTX3-T-0291/PLAN.md
---

# Sprint plan — VRTX3-S-0043

## Goal

Restore three health probes reported as unreachable, so each answers `Content-Type:
application/json` with `{"ok":true,"variant":"<id>"}`. Purely additive: 6 new files under
`routes/api/`, 0 existing source files modified.

## Defects

| Ticket       | Endpoint                               | Root cause                                                                  | Plan                                             |
| ------------ | -------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| VRTX3-T-0289 | `/api/healthz-smoke-bugfix-507266122`  | Handler file never written; `git log --all -S'507266122'` returns 0 commits | [`VRTX3-T-0289/PLAN.md`](./VRTX3-T-0289/PLAN.md) |
| VRTX3-T-0290 | `/api/healthz-smoke-bugfix2-232336916` | Handler file never written; `git log --all -S'232336916'` returns 0 commits | [`VRTX3-T-0290/PLAN.md`](./VRTX3-T-0290/PLAN.md) |
| VRTX3-T-0291 | `/api/healthz-smoke-bugfix3-827939824` | Handler file never written; `git log --all -S'827939824'` returns 0 commits | [`VRTX3-T-0291/PLAN.md`](./VRTX3-T-0291/PLAN.md) |

Each RCA is written once, in that defect's own `PLAN.md`. This file is the index.

## Cross-cutting notes

- **N1 — No shared files, no ordering.** Each defect owns exactly two new files, so the three
  ownership maps are disjoint and no `depends_on` edge is set. Build and merge them in any order,
  in parallel.
- **N2 — All three reported a `404`; all three actually return the SPA shell.** Re-measured live
  during planning against a dev server on `:5003` — each target path returned
  `200 text/html; charset=utf-8` (949 B), while the control `/api/healthz-smoke-528856326-a`
  returned `200 application/json;charset=UTF-8` (33 B). **Thirtieth consecutive confirmation.**
  Assert on the **body and `Content-Type`**; a `404 → 200` check passes whether or not the route
  exists. The defects are real — the stated status code is not.
- **N3 — Read the port from your own Vite banner.** Planning got `:5003` after `:5000`, `:5001` and
  `:5002` were all in use — a value not previously recorded in `AGENTS.md`, whose list runs
  `:5000`–`:5007`. The port is per-container, not per-sprint; do not reuse this number.
- **N4 — Copy `routes/api/healthz-smoke-528856326-a.{ts,test.ts}`, not the files the canvas names.**
  VRTX3-I-0052 names `healthz-smoke-bugfix3-993514120.ts` and its test as the shape reference, and
  `healthz-smoke-bugfix-1054626998.test.ts` as the comment reference. Both were diffed during
  planning: **both tests carry the flaky `expect(elapsed).toBeLessThan(100)` case.** This is the
  harmful form of the drift `AGENTS.md` § Health Probe Routes documents — the fourth recorded
  instance, and the first in which a canvas names two legacy files in two different roles. 47 of
  the 133 probe tests still carry the timing case; the numerator is fixed, so the odds do not
  improve. Record the substitution in your work log.
- **N5 — VRTX3-I-0052's AC-3 demands a sub-100ms assertion. It is dropped, deliberately.** The
  outcome it reaches for — the handler performs no I/O — is guaranteed by the interface contract in
  each `PLAN.md` (only import is `nitro/h3`; no `db/`, no `event.context` read), not by a
  wall-clock number on a shared CI runner. An idea's acceptance criterion does not outrank
  `AGENTS.md` here. No new test file may contain a timing assertion.
- **N6 — Keep the regression header comment; it is not part of the hazard.** VRTX3-I-0052's AC-4
  asks each test to carry a header comment naming the bug, the root cause and the fix. That
  convention is orthogonal to the timing case — only the assertion shape is the risk — so all three
  tests carry the comment and none carry the timing block. The exact comment text is fixed in each
  `PLAN.md`.
- **N7 — The filename is the URL contract.** A typo ships an unreachable route _and_ a passing unit
  test, because the test imports the handler module directly. Only a live request proves the route
  is wired.

## Measured baseline

Taken on `vortex/sprint/vrtx3-s-0043-5e7e01b2` at `4cc3a01`, before any fix:

- 133 `healthz-smoke-*` handlers and 133 colocated tests under `routes/api/`; 268 `.ts` files there
  in total.
- 47 of those 133 tests carry `expect(elapsed).toBeLessThan(100)`.
- Pre-sprint test-file count across `src/` and `routes/`: **140**. Integration QA reports the
  post-sprint total against this figure; the expected delta is +3.

## Root docs

**None fired, and that is the correct outcome for this sprint.**

- `PRODUCT.md` — the capability map already carries the `health probes` line, and it describes the
  family without counting it. Restoring three instances of an existing capability adds no line.
- `ARCHITECTURE.md` — no topology, data-model, integration-point or cross-cutting-constraint change.
  `## Key Decisions` gains nothing: "Health probes duplicate, on purpose" governs this sprint as
  written and predicts exactly this decomposition (three tickets, two new files each, zero
  `depends_on` edges).
- `DESIGN.md` — no token, type-scale, grid, interaction-pattern or accessibility change. Nothing
  user-visible ships.
- `AGENTS.md` — human-authored; never rewritten by an agent. One correction was recorded in
  `.vortex/agents-generated.md`: the probe-family count drifted 130 → 133, as the existing note
  predicted it would.

Per `ARCHITECTURE.md` § Key Decisions, "Root docs carry no per-sprint counts" — the probe-count
figures in `PRODUCT.md` § Changelog are history and are left untouched, and no new changelog entry
is added by planning.

## Design reference

_No design reference on this sprint._ VRTX3-I-0052's design manifest returned zero blocks;
VRTX3-T-0289 and VRTX3-T-0290 have no idea linked at all. No user-visible surface changes, so
there is nothing to export under `artifacts/VRTX3-S-0043/design/`.

## Follow-ups / out of scope

- **F1 — Two of three defects have no idea linked.** VRTX3-T-0289 and VRTX3-T-0290 carry no
  `idea_id`, so their `404` claims were never checked upstream; only VRTX3-T-0291 has a canvas.
  This is the **seventh** occurrence of the uneven-capture split, and its shape has not varied once:
  the grounded half predicts the fallback correctly and cannot measure it, the ungrounded half
  asserts `404` and is wrong. Not a code defect — a defect-capture gap, recorded for whoever owns
  that pipeline.
- **F2 — 47 legacy probe tests still carry a wall-clock assertion.** Never rewritten, so every
  future canvas that samples `routes/api/` keeps landing on one. A sweep to delete the timing
  `it()` blocks would retire this hazard permanently. Out of scope here: it touches 47 files owned
  by no ticket in this sprint.

No genuinely distinct defect surfaced during root-causing. Planning has no DEFECT-creation
authority; both items above are left for a future sprint.
