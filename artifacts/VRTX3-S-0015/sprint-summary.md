# Sprint Summary — VRTX3-S-0015

- **Sprint goal:** "[smoke] Bugfix sprint smoke-bugfix-178637870663710" — serve three previously-missing `/api/healthz-smoke-*` probes.
- **Type:** BUGFIX · **Status at close:** SPRINT_CLOSE · **Outcome:** all acceptance criteria passed, zero defects, zero rework cycles.
- **Dates:** started 2026-08-10, integration QA passed 2026-08-10.

---

## What shipped

Three health probes that were reported missing are now served. Each returns HTTP 200,
`Content-Type: application/json;charset=UTF-8`, and a body deep-equal to `{ ok: true, variant: "<id>" }`:

| Ticket       | Route                                  | Variant       | Result |
| ------------ | -------------------------------------- | ------------- | ------ |
| VRTX3-T-0098 | `/api/healthz-smoke-bugfix-406186407`  | `"406186407"` | DONE   |
| VRTX3-T-0099 | `/api/healthz-smoke-bugfix2-487405332` | `"487405332"` | DONE   |
| VRTX3-T-0100 | `/api/healthz-smoke-bugfix3-418626414` | `"418626414"` | DONE   |

Supporting tickets: **VRTX3-T-0101** (bugfix plan — RCA + per-defect PLAN.md + root-doc updates),
**VRTX3-T-0102** (integration QA report), **VRTX3-T-0103** (this close bundle).

**Scope of change: purely additive.** Six new files — one handler and one colocated test per route —
and **zero existing source files modified**. No new dependency, nothing in `src/`, no schema or
migration, no config change. The probe family grew 56 → 59.

## Root cause (identical for all three)

The handler files were never written. Nitro 3 resolves `/api/<name>` purely from the presence of
`routes/api/<name>.ts` (`nitro({ serverDir: "./", ignore: ["**/*.test.ts"] })`, `vite.config.ts:29`) —
there is no route registry, manifest or import to update, so a file that was never written is a path
that was never registered. A repo-wide grep for each variant id returned **zero matches**, ruling out
a typo'd filename in an existing route. Ruled out by reading code: nginx (`nginx.conf:28` proxies all
of `/api/` with no per-route allowlist), the `ignore` glob (matches only `**/*.test.ts`),
`middleware/auth.ts` (sets `event.context.user`, never returns a response), and shared-module
regression (the family shares no code by design).

## Verification

| Gate                                                                    | Result                                                                                                                |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Lint + typecheck + unit/integration tests (sprint branch, VRTX3-T-0102) | **Pass** — 66 test files, 126 tests, zero lint warnings, zero type errors                                             |
| Playwright E2E, full suite                                              | **Pass** — 5/5 specs in 3.6s, no regression                                                                           |
| Production build                                                        | **Pass** — all three route modules emitted under `.output/server/_routes/api/`; no `*.test.ts`-derived module present |
| Live HTTP against a freshly started server                              | **Pass** — re-confirmed independently during close: all three return `200 application/json;charset=UTF-8`, exact body |
| Defects raised during integration QA                                    | **None**                                                                                                              |

The core gate and the live checks were **re-run during this close ticket**, not merely cited from the
QA report: lint + typecheck + 126 tests green, and all three probes returned their exact contract
body over live HTTP. The figures match VRTX3-T-0102's independently.

## Known Issues

**None.** Integration QA found no defects, no DEFECT ticket was raised, and no rework cycle ran.
`integration-defects-resolution.md` records an empty defect set. This sprint was **not**
conditionally approved — nothing is being carried past close.

---

## Retrospective

### What went well

- **Re-measuring beat trusting the report, for the seventh time.** All three tickets claimed `404`.
  Measured on a live dev server during planning, every path returned `200 text/html` (the SPA
  `index.html` shell) against a control of `200 application/json`. Because the acceptance criteria
  were written against **response body and `Content-Type`** rather than a `404 → 200` transition, the
  fixes were genuinely verifiable — a status-code assertion would have passed whether or not the
  routes existed.
- **Upstream defect capture improved, and it should be said out loud.** For the first time in seven
  occurrences, the idea canvas (VRTX3-I-0024) **pre-emptively flagged its own `404` as a likely
  mis-transcription** and explicitly asked for a measurement rather than asserting it as fact.
  Contrast VRTX3-S-0014, where the wrong code was carried confidently through an Environment table,
  an Evidence section and a mermaid diagram. The upstream fix appears to be taking; worth reinforcing
  rather than treating as noise.
- **The copy-source pointer held for a fourth consecutive sprint.** `AGENT.md` names the `528856326`
  pair and warns against propagating the flaky `responds in under 100ms` case. All three
  implementations copied the correct pair; none carries a timing assertion.
- **Last sprint's cosmetic slip did not recur.** VRTX3-S-0014 left a leftover `healthzA` identifier in
  one test from the copy source. This sprint each test imports its handler under a correctly-derived
  name (`healthzBugfix`, `healthzBugfix2`, `healthzBugfix3`). A retro note actually changed behaviour.
- **Disjoint ownership maps paid off again.** Two new files per ticket, no overlap, so no `depends_on`
  was chained and all three fixes were built and merged in parallel — zero coordination, zero merge
  conflicts.
- **Clean first pass.** Integration QA passed every acceptance criterion on first verification — no
  rework cycle, no defect tickets, no re-verification loop.

### What could improve

- **47 of 59 probe tests still carry the flaky timing assertion.** VRTX3-S-0011 removed
  `expect(elapsed).toBeLessThan(100)` from the _pattern_, and VRTX3-S-0013 fixed the copy-source
  _pointer_ — but neither touched the existing files. A grep for `toBeLessThan` across
  `routes/api/*.test.ts` returns **47 matches**. Every one is a live machine-dependent assertion on a
  shared CI runner _and_ a latent wrong copy-source for the next agent who picks a file by proximity
  instead of by reading `AGENT.md`. The guardrail is currently a doc line, not a property of the
  codebase. A single mechanical sweep deleting those cases would close the hazard permanently; it is
  the highest-value cleanup this family has available.
- **The probe count is duplicated across three root docs and went stale for a full sprint.**
  `ARCHITECTURE.md` read 53 while the tree held 56 — VRTX3-S-0014 bumped `AGENT.md` and `PRODUCT.md`
  and missed the third. Planning caught and corrected it this sprint by re-deriving all three from
  the filesystem. But this is a "one fact, three docs" violation that will drift again: a manually
  maintained count in three places has no mechanism keeping it honest. Either derive it, or keep it in
  exactly one doc and cross-reference.
- **The `404` mis-transcription is now seven sprints old** (VRTX3-S-0001, -0007, -0008, -0009, -0012,
  -0014, -0015). The defect is always real; the status code never is. The root fix belongs upstream in
  defect capture, not in this repository. `AGENT.md § Gotchas` records the seventh occurrence so
  planners re-measure by default.
- **Stop re-raising the probe-retention question — it has been answered by decision, twice.** 59
  near-identical probes now exist across 15 sprints with no retirement policy, and each sprint's retro
  reaches for it again. But the backlog record is unambiguous: **VRTX3-T-0074** (raised in
  VRTX3-S-0011) and **VRTX3-T-0089** (raised in VRTX3-S-0013) both asked for exactly this policy and
  both were **CANCELLED**. Two cancellations is a decision, not an oversight — the implicit answer is
  "probes are kept indefinitely, and that is acceptable." A third ticket would be noise. If the growth
  genuinely becomes a problem, the thing to escalate is the _cancellation rationale_ (which was never
  recorded), not another duplicate request. Noted here so the next close bundle doesn't spend the
  effort a fourth time.
