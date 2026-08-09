# Sprint Summary — VRTX3-S-0011

**Title:** Three Independent Health Check Endpoints (528856326)
**Idea:** VRTX3-I-0019 — `[smoke-178624221710620] 3 independent endpoints (528856326)` (enhancement)
**Sprint goal:** `[smoke] /api/healthz-smoke-528856326-a endpoint`
**Outcome:** ✅ **Shipped — QA PASS, zero defects, no rework cycle**
**Window:** 2026-08-09 10:37:32 → 10:43:45 (+0800) — 6 min 13 s from sprint start to QA sign-off

---

## What shipped

Three standalone Nitro health probes, each answering with `Content-Type: application/json` and a body deep-equal to `{ "ok": true, "variant": "528856326" }`:

| Endpoint                             | Handler                                   | Test          | Ticket       |
| ------------------------------------ | ----------------------------------------- | ------------- | ------------ |
| `GET /api/healthz-smoke-528856326-a` | `routes/api/healthz-smoke-528856326-a.ts` | `…-a.test.ts` | VRTX3-T-0071 |
| `GET /api/healthz-smoke-528856326-b` | `routes/api/healthz-smoke-528856326-b.ts` | `…-b.test.ts` | VRTX3-T-0072 |
| `GET /api/healthz-smoke-528856326-c` | `routes/api/healthz-smoke-528856326-c.ts` | `…-c.test.ts` | VRTX3-T-0073 |

**Blast radius: six new files, zero existing files modified**, no dependency added, nothing in `src/`, no schema or migration. The probe family grew from 44 to 47.

Alongside the code, the planning ticket brought the four root docs to target state — the probe recipe and its no-shared-helper rule were promoted out of seven sprints' worth of changelog entries into `AGENT.md → Conventions`, the family became a first-class feature in `PRODUCT.md`, and `ARCHITECTURE.md` gained an explicit route contract plus a Key Decisions row for the deliberate duplication.

## Tickets

| Ticket       | Type            | Status | Delivered                                                           |
| ------------ | --------------- | ------ | ------------------------------------------------------------------- |
| VRTX3-T-0068 | TASK (product)  | DONE   | Sprint plan, four root docs at target state, three per-TASK PLAN.md |
| VRTX3-T-0069 | EPIC            | DONE   | Container — closed by rollup                                        |
| VRTX3-T-0070 | STORY           | DONE   | Container — closed by rollup                                        |
| VRTX3-T-0071 | TASK (engineer) | DONE   | `-a` handler + test                                                 |
| VRTX3-T-0072 | TASK (engineer) | DONE   | `-b` handler + test                                                 |
| VRTX3-T-0073 | TASK (engineer) | DONE   | `-c` handler + test                                                 |
| VRTX3-T-0075 | TASK (qa)       | DONE   | Integration QA report, E2E run, defects-resolution record           |
| VRTX3-T-0076 | TASK (product)  | —      | This close bundle                                                   |

**No DEFECT tickets were filed.** The sprint went PLANNING → EXECUTION → INTEGRATION_QA → CLOSE with no REWORK phase, so no observable behavior changed after the root docs were written and **no root-doc update is due at close**. Verified rather than assumed: `ARCHITECTURE.md` and `PRODUCT.md` both state 47 probes, and the repository now holds exactly 47 probe handlers.

**Known issues left open: none.** This sprint was not conditionally approved; QA found nothing to defer.

## Verification (from VRTX3-T-0075)

| Gate                                       | Result                                                                                               |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Lint (ESLint 10, `--max-warnings 0`)       | clean                                                                                                |
| Typecheck (`tsc --build`, strict)          | clean                                                                                                |
| Unit / integration (Vitest)                | **111/111 passed across 54 files**                                                                   |
| Production build                           | succeeded; all three route chunks emitted under `.output/server/_routes/api/`, no `.test.ts` leakage |
| Playwright E2E (chromium)                  | **5/5 passed**                                                                                       |
| Live verification against the built server | all three routes returned `200 application/json;charset=UTF-8` with the exact body, GET and non-GET  |
| Negative control                           | a nonexistent route returned `200 text/html` (SPA shell), proving the check can actually fail        |

---

## Retrospective

### What went well

**The parallelism claim held, and this time there is evidence rather than assertion.** The three ticket branches squash-merged at 10:39:12, 10:39:18 and 10:39:21 — nine seconds apart, roughly 100 seconds after planning landed. Merge order was **b, a, c**: not alphabetical, not the order they were created. Three agents finished in an order nobody coordinated, and the merges produced zero conflicts because there was no shared file to conflict over. That is precisely the property the sprint existed to demonstrate.

**The isolation shows up in the test counts.** Each engineer independently reported _52 test files / 109 tests_ from their own branch; the integrated branch reports _54 / 111_. The arithmetic (51 baseline + 1 each, + 3 integrated) confirms each agent worked from the sprint branch before any sibling had merged — genuine concurrency, not three sequential runs wearing a parallel costume.

**Pre-authored PLAN.md files were followed exactly.** All three engineers reported no deviation, including the non-obvious instruction to _drop_ the sibling template's `< 100ms` timing assertion — a case where copying the reference file faithfully would have been the wrong move. Writing that as an explicit numbered step, rather than trusting a copy-and-adapt instinct, is what made three independent agents produce byte-identical structure.

**QA closed the coverage gap instead of reporting it.** The Playwright suite targets the SPA shell and `/api/hello`; no spec covers `healthz-smoke-*` routes. Rather than passing the sprint on unit tests that import handlers directly — which pass whether or not Nitro ever registered the route — QA started the built production server, curled all three endpoints, and **ran a negative control** against a nonexistent path to prove the verification method could distinguish a working route from the SPA fallback. After four consecutive sprints tripped over exactly that trap, this is the first one where the check was designed to be falsifiable.

**Planning caught a wrong acceptance criterion before an engineer built to it.** The idea asserted that `POST`/`PUT`/`DELETE` "does not return the 200 success body". It does — these handlers declare no method guard. Planning measured this against the codebase, planned to the idea's own out-of-scope line instead, and QA later confirmed the behavior live (POST to `-a` and DELETE to `-b` both returned the contracted 200 body). Had the wrong criterion been taken at face value, an engineer would have added a 405 to three routes and left them inconsistent with the other 44.

### What could improve

**Root-doc references in ticket fields are silently destructive.** Writing "see AGENT.md Gotchas" inside an acceptance criterion caused the server's root-doc filter to delete **the entire criterion**, not just the doc name — and on the first pass this removed the single most important check (live request, assert on body and `Content-Type`) from all three TASKs at once. It was caught and re-added, but only because the creation response happened to be read carefully. The filter reports what it removed; that report needs to be treated as an error, not a notice. Practical rule: cite repo knowledge _inline_ in ticket fields and keep root-doc cross-references in PLAN.md, where they survive.

**One STORY per endpoint was the wrong shape, and three prior sprints used it.** This sprint merged them into one, cutting the backlog from eight tickets to six with no loss. Worth carrying forward: containers should map to demoable behavior, not to units of parallel execution — the TASKs already carry the parallelism.

**The probe family is now 47 handlers and 47 tests, ~98% of `routes/api/`, and nothing has ever been retired.** Every one is a live production route and a CI test case. The per-sprint cost is negligible, which is exactly why no one has priced the aggregate. Raised as **VRTX3-T-0074** (`improvement`, p3) — the idea's own Open Question 2, deliberately left as a decision for someone with visibility into whether any external monitor actually calls these paths.

**E2E coverage for this route family remains structurally absent.** QA's production-server verification was thorough, but it is a manual step re-derived each sprint rather than a committed spec. A single parameterized Playwright spec asserting body and `Content-Type` across the probe family would make this permanent — though it would also become the first shared file the probes touch, which cuts against the family's whole design. Genuinely a trade-off, not an oversight; flagging it rather than resolving it here.

### Trend worth noting

Four consecutive sprints (VRTX3-S-0001, -0007, -0008, -0009) each independently re-discovered that a missing `/api/*` route returns `200 text/html`, each after acting on a bug report claiming `404`. This sprint is the first where that knowledge was moved _out_ of the changelog — where it was being rewritten every sprint and read by no one — and into `AGENT.md → Conventions` and `→ Gotchas`, ahead of where an agent starts writing code. Whether that actually stops the fifth recurrence is the thing to watch next sprint.
