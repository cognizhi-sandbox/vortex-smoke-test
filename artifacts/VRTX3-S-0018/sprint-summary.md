# Sprint Summary — VRTX3-S-0018

- **Goal:** `[smoke] Bugfix sprint smoke-bugfix-178640575450999` — serve three previously-missing
  `/api/healthz-smoke-*` probes.
- **Type:** Bugfix · **Status at close:** SPRINT_CLOSE · **Verdict:** PASS, no defects, no rework round
- **Dates:** planned 2026-08-10, executed and closed 2026-08-11

---

## What shipped

Three health probes that did not previously exist, each an independent, self-contained Nitro route
returning `HTTP 200`, `Content-Type: application/json`, body `{"ok":true,"variant":"<id>"}`:

| Ticket       | Route                                  | Variant       | Status |
| ------------ | -------------------------------------- | ------------- | ------ |
| VRTX3-T-0123 | `/api/healthz-smoke-bugfix-699186705`  | `"699186705"` | DONE   |
| VRTX3-T-0124 | `/api/healthz-smoke-bugfix2-502272230` | `"502272230"` | DONE   |
| VRTX3-T-0125 | `/api/healthz-smoke-bugfix3-850084489` | `"850084489"` | DONE   |

Supporting tickets: **VRTX3-T-0126** (bugfix plan) and **VRTX3-T-0127** (integration QA report), both
DONE.

**Blast radius:** 6 new files (3 handlers + 3 colocated tests), **0 existing source files modified**,
no new dependency, nothing under `src/`, no schema or migration, no config change. Probe family
65 → 68.

## Root cause (identical for all three)

The handler files were never written. Nitro 3 runs with `serverDir: "./"` (`vite.config.ts:29`) and
resolves `/api/<name>` purely from the presence of `routes/api/<name>.ts` — no registry, no manifest,
no import to update. A repo-wide grep for each variant id returned zero matches before the fix, so
these were never-written files rather than typo'd filenames. Nothing regressed and nothing was
misconfigured.

**All three tickets reported `404`. None of them returned `404`.** Measured live during planning and
again by each implementer: every missing path returned `200 text/html; charset=utf-8` — the SPA
`index.html` shell — while the control `/api/healthz-smoke-528856326-a` returned
`200 application/json;charset=UTF-8`. The defects were real; only the stated status codes were not.
Every acceptance criterion in this sprint was therefore written to assert on **response body +
`Content-Type`**, never on a `404 → 200` transition, which would have passed before _and_ after the
fix.

## Verification (from VRTX3-T-0127)

- Live requests against a running server confirmed all three routes return the exact contracted
  body and `Content-Type` — verified by request, not by source inspection.
- Unit/component/API suite: **135 passed across 75 files**, including the three new colocated tests.
- Lint (ESLint 10, `--max-warnings 0`): 0 warnings, 0 errors. Typecheck: 0 errors.
- Full Playwright E2E suite: **5 passed, 0 failed**.
- Production build emitted `.output/server/_routes/api/healthz_smoke_bugfix{,2,3}_*.mjs`, confirming
  all three compiled into the production server rather than merely existing as source.

## Documentation

`AGENT.md`, `ARCHITECTURE.md` and `PRODUCT.md` were brought to target state on the planning ticket:
probe count 65 → 68 re-derived from the filesystem and bumped in all three docs in the same pass,
each with a dated Changelog entry. `AGENT.md` § Gotchas records the tenth consecutive SPA-fallback
confirmation. `DESIGN.md` was untouched — no UI surface changed.

No rework occurred, so no observable behavior changed after QA and no further doc update was
required at close. Doc counts re-verified against the filesystem this run: 68 handlers on disk,
68 in all three docs.

## Known Issues

**None.** The sprint closed with a clean QA verdict — no defects were found during integration QA,
no DEFECT tickets remain open, and no rework round was needed. `integration-defects-resolution.md`
records an empty defect set.

---

## Retrospective

### What went well

- **Parallelism worked exactly as planned.** The three ownership maps were disjoint (two new files
  each, zero modified), so no `depends_on` was set and all three tickets were built and merged
  independently. Zero merge conflicts, zero cross-ticket coordination.
- **First-pass QA success.** No rework round, no defects, no re-verification cycle. Planning's
  fixed interface contract was copied verbatim by all three implementers — the delivered handlers
  are byte-for-byte structural matches of the contract in each ticket description.
- **The `528856326` copy-source pointer held for a fourth sprint.** None of the three new tests
  carry the flaky wall-clock `responds in under 100ms` case; it stays confined to the 47
  pre-VRTX3-S-0011 tests (now 47 of 68). The idea behind VRTX3-T-0125 named that documented pair
  itself — the first time an idea has pointed at the template instead of sampling the directory.
- **The SPA-fallback trap was caught before it could shape verification.** Every acceptance
  criterion asserted on body + `Content-Type`; every implementer independently re-measured and
  reached the same conclusion; QA verified by live request rather than source inspection.
- **Doc counts moved together.** All three docs carrying the probe count were bumped in one pass
  from a filesystem re-derivation, avoiding the split-update drift that left `ARCHITECTURE.md`
  stale for a full sprint after VRTX3-S-0014.

### What could improve

- **Upstream defect capture still mis-transcribes `404` for `/api/*` paths — tenth consecutive
  sprint.** The gap is now visible _within a single sprint_: the idea behind VRTX3-T-0125
  (VRTX3-I-0027) measured the SPA fallback itself and flagged its own `404` as wrong, while
  VRTX3-T-0123 and VRTX3-T-0124 have **no idea linked at all** and repeated the `404` unchecked.
  Because you cannot tell which kind of report you are holding without re-measuring, the cost is
  paid every sprint. This originates in defect capture, outside this repository — nothing here can
  fix it, which is why the mitigation stays documentary (`AGENT.md` § Gotchas).
- **Two of three defects arrived with no idea behind them.** VRTX3-T-0123 and VRTX3-T-0124 returned
  "not linked to an idea" from `a2a_get_idea_canvas`, leaving the ticket description as the only
  spec. It was sufficient here because the probe contract is trivial and well-documented; on a
  less formulaic defect it would not be.
- **Dev server port drifts between containers.** `vite.config.ts` asks for 5000; planning got 5006
  and the implementers got 5005, because lower ports were already bound. Any verification that
  hardcodes 5000 measures the wrong thing or nothing at all — read the Vite banner.
- **`a2a_update_ticket` strips root-doc references line-granularly.** During planning, a
  description line ending in a root-doc cross-reference was removed _in full_, taking a substantive
  paragraph with it. The rule itself is right; the granularity means a mid-paragraph mention costs
  the whole paragraph, so keep root-doc references out of ticket bodies entirely.
- **Eight bugfix sprints of this identical shape have now run** (VRTX3-S-0001, -0007, -0008, -0009,
  -0012, -0014, -0015, -0018), each adding never-written probes reported as `404`. The per-sprint
  cost is small and the pattern is well-oiled, but the repetition is a signal about how this work
  is generated upstream, not about execution here.
