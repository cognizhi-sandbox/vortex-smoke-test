# Sprint Summary — VRTX3-S-0014

- **Sprint goal:** "[smoke] Bugfix sprint smoke-bugfix-178637543331085" — serve three previously-missing `/api/healthz-smoke-*` probes.
- **Type:** BUGFIX · **Status at close:** SPRINT_CLOSE · **Outcome:** all acceptance criteria passed, zero defects, zero rework cycles.
- **Dates:** started 2026-08-10, integration QA passed 2026-08-10.

---

## What shipped

Three health probes that were reported missing are now served. Each returns HTTP 200,
`Content-Type: application/json;charset=UTF-8`, and a body deep-equal to `{ ok: true, variant: "<id>" }`:

| Ticket       | Route                                  | Variant       | Result |
| ------------ | -------------------------------------- | ------------- | ------ |
| VRTX3-T-0092 | `/api/healthz-smoke-bugfix-174694844`  | `"174694844"` | DONE   |
| VRTX3-T-0093 | `/api/healthz-smoke-bugfix2-754372119` | `"754372119"` | DONE   |
| VRTX3-T-0094 | `/api/healthz-smoke-bugfix3-404580234` | `"404580234"` | DONE   |

Supporting tickets: **VRTX3-T-0095** (bugfix plan — RCA + per-defect PLAN.md + root-doc updates),
**VRTX3-T-0096** (integration QA report), **VRTX3-T-0097** (this close bundle).

**Scope of change: purely additive.** Six new files — one handler and one colocated test per route —
and **zero existing source files modified**. No new dependency, nothing in `src/`, no schema or
migration, no config change. The probe family grew 53 → 56.

## Root cause (identical for all three)

The handler files were never written. Nitro 3 resolves `/api/<name>` purely from the presence of
`routes/api/<name>.ts` (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, `vite.config.ts:29`) —
there is no route registry, manifest or import to update, so a file that was never written is a path
that was never registered. A repo-wide grep for each variant id returned **zero matches**, ruling out
a typo'd filename in an existing route. Ruled out by reading code: nginx (proxies all of `/api/` with
no per-route allowlist), the `ignore` glob (matches only `**/*.test.ts`), `middleware/auth.ts` (sets
`event.context.user`, never returns a response), and shared-module regression (the family shares no
code by design).

## Verification

| Gate                                                                    | Result                                                                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Lint + typecheck + unit/integration tests (sprint branch, VRTX3-T-0096) | **Pass** — 63 test files, 123 tests, zero lint warnings, zero type errors                                                       |
| Playwright E2E, full suite                                              | **Pass** — 5/5 specs in 3.8s, no regression                                                                                     |
| Production build                                                        | **Pass** — all three route modules emitted under `.output/server/_routes/api/`; no `*.test.ts`-derived module present           |
| Live HTTP against a freshly started server                              | **Pass** — re-confirmed independently during close: all three return `200 application/json;charset=UTF-8` with the correct body |
| Defects raised during integration QA                                    | **None**                                                                                                                        |

## Known Issues

**None.** Integration QA found no defects, no DEFECT ticket was raised, and no rework cycle ran.
`integration-defects-resolution.md` records an empty defect set. This sprint was not conditionally
approved — nothing is being carried past close.

---

## Retrospective

### What went well

- **Re-measuring beat trusting the report.** All three tickets claimed `404`. Measured on a live dev
  server during planning, every path returned `200 text/html` (the SPA `index.html` shell). Because
  the acceptance criteria were written against **response body and `Content-Type`** rather than a
  `404 → 200` transition, the fixes were verifiable — a status-code assertion would have passed
  whether or not the routes existed.
- **The copy-source pointer did its job, twice.** `AGENT.md` names the `528856326` pair and warns
  against propagating the flaky `responds in under 100ms` case. All three implementations copied the
  correct pair and none carries a timing assertion — the flake that VRTX3-S-0011 removed stayed
  removed for a third consecutive sprint.
- **Disjoint ownership maps paid off.** Two new files per ticket, no overlap, so no `depends_on` was
  chained and all three fixes were built and merged in parallel with zero coordination and zero
  merge conflicts.
- **Clean first pass.** Integration QA passed every acceptance criterion on first verification — no
  rework cycle, no defect tickets, no re-verification loop.

### What could improve

- **The `404` mis-transcription reached us through a full evidence section this time.** The idea
  canvas for VRTX3-I-0023 didn't just state `404` in passing — it carried the wrong code through an
  Environment table, an Evidence section and a mermaid diagram terminating in "404 Not Found —
  actual behaviour". This is the **sixth consecutive sprint** hitting it (VRTX3-S-0001, -0007, -0008,
  -0009, -0012, -0014). The defect is always real; the status code never is. The fix belongs upstream
  in defect capture, not in this repository — `AGENT.md § Gotchas` now says so explicitly so future
  planners re-measure by default rather than re-discovering it.
- **The canvas's prescribed copy source was wrong.** VRTX3-I-0023 named `healthz-smoke-bugfix3-196651982`,
  whose test carries the flaky timing assertion. Planning overrode it. Worth noting that idea canvases
  can carry stale implementation pointers that contradict `AGENT.md`; the repo doc is the authority.
- **One cosmetic slip survived review.** `healthz-smoke-bugfix2-754372119.test.ts` imports the handler
  as `healthzA` — a leftover identifier from the `528856326-a` copy source. Harmless (it is a local
  binding, the assertion and route name are correct) and not worth a ticket, but it is the kind of
  detail a copy-paste workflow reliably produces.
- **This family's growth is unmanaged.** 56 near-identical probes now exist, added by 14 sprints, with
  no retirement policy. Each is individually trivial; collectively they are a slowly growing share of
  the route table and the test suite. Deliberately out of scope here, and the no-sharing convention is
  a sound decision — but "when do probes get retired?" remains unanswered and is worth a product
  decision before the count doubles again.
