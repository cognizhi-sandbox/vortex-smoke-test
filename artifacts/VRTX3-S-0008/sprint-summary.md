# Sprint Summary — VRTX3-S-0008

**Goal:** `[smoke] Bugfix sprint smoke-bugfix-178619573250808`
**Status:** Closed — goal met, no defects found, no rework cycle.
**Dates:** started 2026-08-08, completed 2026-08-08.

## What shipped

Three previously-missing health-check endpoints now serve their JSON contract:

| Endpoint                               | Response                            | Ticket       |
| -------------------------------------- | ----------------------------------- | ------------ |
| `/api/healthz-smoke-bugfix-739648350`  | `{"ok":true,"variant":"739648350"}` | VRTX3-T-0049 |
| `/api/healthz-smoke-bugfix2-901895284` | `{"ok":true,"variant":"901895284"}` | VRTX3-T-0050 |
| `/api/healthz-smoke-bugfix3-221117839` | `{"ok":true,"variant":"221117839"}` | VRTX3-T-0051 |

All three return HTTP 200 with `Content-Type: application/json;charset=UTF-8`.

## Ticket ledger

| Ticket       | Type   | Title                                  | Status |
| ------------ | ------ | -------------------------------------- | ------ |
| VRTX3-T-0052 | TASK   | Bugfix plan — VRTX3-S-0008             | DONE   |
| VRTX3-T-0049 | DEFECT | `/api/healthz-smoke-bugfix-739648350`  | DONE   |
| VRTX3-T-0050 | DEFECT | `/api/healthz-smoke-bugfix2-901895284` | DONE   |
| VRTX3-T-0051 | DEFECT | `/api/healthz-smoke-bugfix3-221117839` | DONE   |
| VRTX3-T-0053 | TASK   | Integration QA report — VRTX3-S-0008   | DONE   |
| VRTX3-T-0054 | TASK   | Sprint close bundle — VRTX3-S-0008     | (this) |

## What changed in the codebase

**Purely additive: 6 new source files, 0 existing files modified.** Three handlers plus three
co-located H3Event integration tests under `routes/api/`. No config, schema, migration, UI or
dependency change. The only non-source edit was a dated `AGENT.md` changelog entry, written
during planning.

Root cause was identical across all three: the Nitro route module was **never written**. Routing
is purely filename-driven from `routes/api/`, so an absent file means an unregistered route.
Nothing was misconfigured — the ~40 sibling endpoints resolved correctly throughout.

## Verification

| Gate                               | Result                                                      |
| ---------------------------------- | ----------------------------------------------------------- |
| Lint (zero-warning) + typecheck    | ✅ Pass                                                     |
| Vitest                             | ✅ 102/102 tests, 48/48 files                               |
| Production build                   | ✅ All 3 routes compiled into `.output/server/_routes/api/` |
| Live HTTP against production build | ✅ 3/3 + control return correct body **and** `Content-Type` |
| E2E (Playwright, chromium)         | ✅ 5/5 passed                                               |

The Vitest result was re-run independently at close and reproduced QA's figure exactly
(102/102, 48/48). Detail: `qa-test-report.md`, `integration-test-result.md`.

## Known issues

None. The sprint closed clean — QA found no defects and no ticket was left open.

## Retrospective

### What went well

- **Planning refused to trust the defect reports, and it paid off.** All three tickets claimed
  the endpoints "return 404". Measured against a live server, they returned `200 text/html` (the
  SPA `index.html` fallback). That distinction is not pedantic: a `expect(status).toBe(200)` test
  **passes on a build where the endpoint is still missing**. Because this was caught before
  engineering, every Definition-of-Done required asserting on body + `Content-Type`, and no
  false-green verification was possible anywhere in the chain.
- **QA verified the real thing, not the convenient thing.** Rather than resting on the H3Event
  unit tests, QA exercised the compiled production server over real HTTP and confirmed body and
  `Content-Type` per route, plus the control. That is the only evidence that actually
  distinguishes "fixed" from "still missing" here.
- **Genuine parallelism with zero coordination cost.** Three disjoint file pairs, no shared
  helper, no `depends_on`. All three tickets ran concurrently, merged without conflict, and
  modified nothing pre-existing — a clean 0-regression blast radius.
- **Two standing assumptions were closed by measurement**, not asserted: handlers are
  method-agnostic (`POST`/`PUT`/`DELETE` return the same 200 JSON, no 405/500), and
  `bun run build` maps a route to `.output/server/_routes/api/<name_with_underscores>.mjs`. Both
  are now recorded in `AGENT.md` for future sprints.

### What could improve

- **The defect-capture template keeps producing unverifiable repro steps — 4th consecutive
  sprint.** Every ticket in VRTX3-S-0001/0002/0003/0007/0008 asserts a `404` this codebase never
  returns, and the repro step `curl <path> — observe 404` cannot reproduce anything. The cost is
  paid repeatedly: each sprint re-derives the same measurement and re-documents the same gotcha.
  The fix belongs in the capture template (require body + `Content-Type` evidence for API-route
  defects), not in application code. **This remains unowned** — product has no DEFECT-creation
  authority, so it has now been carried forward unresolved twice.
- **Still no negative-path regression test.** Nothing anywhere asserts that an unknown `/api/*`
  path is _not_ JSON. A future route deletion or rename would therefore fail silently, since the
  SPA fallback answers `200` regardless. A single test pinning that behavior would convert this
  recurring class of defect from "invisible" to "caught by CI".
- **`routes/api/` is accumulating throwaway smoke routes: now 85 files / 41 endpoints**, none
  referenced by `src/` or `e2e/`, growing by ~3 per bugfix sprint. The directory is becoming
  noise that makes a genuinely missing route harder to spot by inspection — which is precisely
  the failure mode this sprint kept fixing.
- **E2E has no coverage of this endpoint family.** The 5 Playwright specs target UI only, so QA
  had to compensate with manual live-HTTP checks each sprint. That manual step is the load-bearing
  verification and it is not automated.
