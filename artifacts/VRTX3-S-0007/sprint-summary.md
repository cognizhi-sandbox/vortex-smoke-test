# Sprint Summary — VRTX3-S-0007

**Goal:** `[smoke] Bugfix sprint smoke-bugfix-178602042849531` — restore three missing
`/api/healthz-smoke-*` endpoints so each serves its `{ok, variant}` JSON contract.

**Outcome:** ✅ All 3 committed defects delivered and verified. QA verdict **PASS**
(`qa.all_acs_passed`) — zero defects logged, zero rework cycles, no regressions.
**Date closed:** 2026-08-06

---

## What shipped

| Ticket       | Endpoint                               | Response                            | Status  |
| ------------ | -------------------------------------- | ----------------------------------- | ------- |
| VRTX3-T-0043 | `/api/healthz-smoke-bugfix-534542341`  | `{"ok":true,"variant":"534542341"}` | ✅ Done |
| VRTX3-T-0044 | `/api/healthz-smoke-bugfix2-279986033` | `{"ok":true,"variant":"279986033"}` | ✅ Done |
| VRTX3-T-0045 | `/api/healthz-smoke-bugfix3-605591646` | `{"ok":true,"variant":"605591646"}` | ✅ Done |

Each returns `200` with `Content-Type: application/json`.

**Root cause (all three, identical):** the Nitro route module under `routes/api/` was never
written, so the file-based router registered no route for the path. No bug existed in the
router, `vite.config.ts`, or any existing handler — the fix was purely to add the missing files.

**Change footprint:** 6 new files (3 handlers + 3 tests), **0 existing files modified**. No
schema change, no migration, no dependency change, no config change.

## Delivery record

| Commit    | Ticket       | Files                                               |
| --------- | ------------ | --------------------------------------------------- |
| `e45e928` | VRTX3-T-0046 | Bugfix plan (SPRINT-PLAN.md + 3 per-defect PLAN.md) |
| `624aff8` | VRTX3-T-0043 | handler + test + fix-note + tdd-test-result         |
| `9d45707` | VRTX3-T-0044 | handler + test + fix-note + tdd-test-result         |
| `6863ddf` | VRTX3-T-0045 | handler + test + fix-note + tdd-test-result         |
| `2eaab67` | VRTX3-T-0047 | integration QA report + integration-test-result     |

All three fixes ran fully in parallel — ownership maps were disjoint by design, so no
`depends_on` was chained and no engineer blocked another.

## Verification

- `bun run verify` (lint zero-warning + typecheck + Vitest) — green on the integrated branch.
- `bun run build` — succeeds; production server registers all three routes.
- Playwright chromium suite — **5 passed, 0 failed** (3.8s), no regressions.
- **Verified against the real built server, not just unit mocks:** QA started
  `bun .output/server/index.mjs` and curled each endpoint, confirming body **and**
  `Content-Type: application/json` for all three.

## Retrospective

**What went well**

- **Planning caught a false premise before any code was written.** All three tickets claimed
  the endpoints "return 404". They never did — an unmatched `/api/*` path is answered by the
  SPA `index.html` fallback with `200 text/html`. Reproducing this during planning, rather than
  trusting the ticket text, is what kept the sprint honest.
- **That correction propagated into every DoD and held.** Because acceptance criteria demanded
  a body + `Content-Type` assertion instead of a status-code check, no engineer could write a
  test that passes whether or not the route exists. Every delivered test asserts the exact
  response object.
- **QA independently re-derived the finding** instead of taking it on faith — including a
  control request to a still-nonexistent path (`/api/healthz-smoke-nonexistent-000` →
  `200 text/html`) that positively demonstrates the assertion strategy was necessary.
- **Genuinely parallel execution.** Disjoint file ownership meant three tickets, three
  independent commits, zero coordination overhead and zero merge conflicts.
- **Zero rework.** No defects logged against the sprint; QA required no fixes.

**What could improve**

- **The defect-capture template keeps producing unverifiable repro steps.** "curl `<path>` —
  observe 404" has now shipped in four consecutive sprints (VRTX3-S-0001/0002/0003 and this
  one) describing a symptom this codebase cannot produce. Each sprint pays the same
  re-verification cost. The template should require body + `Content-Type` evidence for
  API-route defects.
- **There is still no negative-path test** asserting an unknown `/api/*` path is _not_ JSON.
  The SPA-shadows-API behavior remains undetected by CI, so a future route deletion or rename
  would go silently unnoticed — exactly the failure mode this sprint just fixed by hand.
- **`routes/api/` now holds 41 near-duplicated healthz handlers.** Deliberately not refactored
  (a parameterised route is out of scope for a bugfix sprint), but the duplication is
  accumulating and deserves a decision rather than continued drift.

## Carried-forward follow-ups

No defects were left open by this sprint. The two items below are pre-existing, out-of-scope
observations carried from `SPRINT-PLAN.md` and independently concurred with by QA. Neither is
filed as a ticket — product has no DEFECT-creation authority by design — so they are recorded
here to survive the sprint:

1. **Unmatched `/api/*` paths resolve to the SPA fallback (`200 text/html`) instead of a JSON
   `404`.** A router/fallback-precedence issue affecting every mistyped or nonexistent API
   path; it is the reason the original defect reports misdescribed the symptom.
2. **Defect-capture template produces unverifiable "observe 404" repro steps** for API-route
   defects (see retrospective above).
