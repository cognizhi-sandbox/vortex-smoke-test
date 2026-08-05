# Integration QA Report — VRTX3-S-0001

**Sprint goal:** `[smoke] Bugfix sprint smoke-bugfix-1785889878831367` — restore
three missing `/api/healthz-smoke-*` endpoints so each returns its
`{ok, variant}` JSON.

**Ticket:** VRTX3-T-0005 · **Base commit:** `94f7504` · **Sprint branch tip verified:** `35a5967`
**Committed tickets:** VRTX3-T-0001, VRTX3-T-0002, VRTX3-T-0003
**Date:** 2026-08-05

---

## Executive Summary

All three committed defects are fixed and verified on the integrated sprint
branch. `bun run verify` (lint + typecheck + unit/integration tests) is green,
the production build (`bun run build`) succeeds and correctly registers all
three new routes, and the full Playwright chromium suite passes 5/5. No
regressions were found in any other route. Zero defects were logged against
this sprint — **no fixes were required from QA**, and no unfixable defects
were filed. Verdict: **PASS — recommend `qa.all_acs_passed`.**

The three tickets' plans flagged that the originally-reported symptom ("returns
404") does not reproduce — unmatched `/api/*` paths return `200 text/html` via
the SPA fallback both before and after the fix. QA independently reproduced
this on the built server (see Code Review) and confirmed the tickets'
acceptance criteria were rewritten correctly to assert on response body and
`Content-Type: application/json` instead of status code, which is the only
way this defect class is actually verifiable.

## E2E Test Status

Full Playwright chromium suite executed against the production-equivalent dev
server per `playwright.config.ts` (`bun x vite --port 5178 --strictPort`).
Command: `bun run test:e2e -- --project=chromium`.

Real stdout (see `integration-test-result.md` for the complete capture):

```
Running 5 tests using 4 workers

  ✓  3 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (912ms)
  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (1.2s)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (402ms)
  ✓  1 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (1.4s)
  ✓  4 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (1.4s)

  5 passed (5.7s)
```

`E2E-RESULT: chromium 5 passed, 0 failed`

The existing E2E suite does not target the new `healthz-smoke-*` routes
directly (by sprint convention these are covered by route-level `H3Event`
integration tests, not Playwright specs — see Unit Test Results). QA
additionally exercised the three new endpoints against the **built production
server** (`bun .output/server/index.mjs`) as an acceptance-criterion check,
documented under Code Review below.

## Unit Test Results

Command: `bun run test` → `NODE_ENV=test bun --bun vitest run`

```
 Test Files  39 passed (39)
      Tests  84 passed (84)
   Duration  4.69s
```

All 39 test files pass, including the three new route tests added by this
sprint:

| Test file                                            | Result        |
| ---------------------------------------------------- | ------------- |
| `routes/api/healthz-smoke-bugfix-868175391.test.ts`  | ✅ 2/2 passed |
| `routes/api/healthz-smoke-bugfix2-101584827.test.ts` | ✅ 2/2 passed |
| `routes/api/healthz-smoke-bugfix3-403022997.test.ts` | ✅ 2/2 passed |

Each asserts the exact `{ ok: true, variant: "<id>" }` body via a real
`H3Event` (not a mock) and a <100ms response-time bound, matching the
established repo pattern (`routes/api/healthz-smoke-bugfix-26031336.test.ts`
and siblings).

## Code Review

Reviewed the diff introduced by VRTX3-T-0001/0002/0003 (6 new files, 0 files
modified):

- `routes/api/healthz-smoke-bugfix-868175391.ts` / `.test.ts`
- `routes/api/healthz-smoke-bugfix2-101584827.ts` / `.test.ts`
- `routes/api/healthz-smoke-bugfix3-403022997.ts` / `.test.ts`

Each handler is a minimal `defineHandler` from `"nitro/h3"` returning a static
literal object, context-free (does not read `event.context`, consistent with
the plan's instruction to avoid coupling to `middleware/auth.ts`). Each is a
verbatim structural copy of its nearest sibling with only the variant string
changed — no shared/parameterised helper was introduced, matching the
project's explicit convention (`AGENT.md` changelog: ~30 independent
self-contained handlers) and the plan's explicit instruction not to refactor.
No existing file was touched, so blast radius is zero for every other route.

**Independent re-verification of the acceptance criteria against the real
production build** (not just the unit test mocks), run by QA:

```
$ bun run build          # tsc --build && vite build — succeeded, 0 errors
$ bun .output/server/index.mjs &
$ curl -s -D - http://localhost:3000/api/healthz-smoke-bugfix-868175391
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"868175391"}

$ curl -s -D - http://localhost:3000/api/healthz-smoke-bugfix2-101584827
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"101584827"}

$ curl -s -D - http://localhost:3000/api/healthz-smoke-bugfix3-403022997
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"403022997"}

# Control — confirms the tickets' correction to the reported symptom:
$ curl -s -D - http://localhost:3000/api/healthz-smoke-nonexistent-000
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

This confirms: (a) all three routes are genuinely registered in the compiled
Nitro server, not just resolvable in-process in Vitest; (b) each returns the
correct JSON body and `application/json` content-type; (c) the control case
(an endpoint that still doesn't exist) is distinguishable only by body/
content-type, not status code — validating the tickets' correction that a
"404 → 200" check would pass vacuously and must not be relied upon.

No code smells, no dead code, no missing error handling gaps (none is
expected for a static healthz literal). No refactor risk introduced.

## Coverage Summary

No coverage-instrumentation tool (v8/istanbul) is configured in this repo, so
coverage is reported by file/route accounting rather than line percentage:

- `routes/api/*.ts` handlers: **33/33** have a matching `*.test.ts` (100%),
  including all 3 new handlers from this sprint.
- `src/` unit/component tests: 4 test files (utils + components), unchanged
  by this sprint — no source in `src/` was touched.
- Total suite: 39 test files, 84 tests, all passing.
- E2E: 5/5 Playwright specs passing (home page + smoke, unchanged by this
  sprint's scope — no UI/frontend files were touched).

Gaps (pre-existing, out of scope for this bugfix sprint, noted for
transparency): the sprint's own follow-up notes flag that unmatched `/api/*`
paths returning `200 text/html` instead of a JSON `404` is untested by the
E2E suite and remains an open, unticketed issue (see Issues Found).

## Issues Found

**None within this sprint's scope.** All three defects fixed correctly, no
regressions, no flaky tests observed across 2 full test runs.

Two pre-existing, out-of-scope observations carried over from the sprint plan
(not new defects introduced by this sprint, not fixed here per plan guidance
to avoid scope creep in a bugfix sprint):

1. Unmatched `/api/*` paths resolve to the SPA fallback (`200 text/html`)
   instead of a JSON `404`. This is a router/fallback-precedence issue
   affecting every mistyped or nonexistent API path, and is what caused the
   original defect reports to inaccurately describe a "404" symptom. Product
   has explicitly not authorized a DEFECT ticket for this (see
   `SPRINT-PLAN.md` Follow-ups). QA concurs this is a separate concern from
   the three committed defects and does not block this sprint.
2. `routes/api/` now holds 33 near-duplicated healthz handlers. A
   parameterised route would collapse them, but this is a refactor explicitly
   out of scope for a bugfix sprint per repo convention.

Neither item is filed as a DEFECT ticket by QA, per the sprint plan's
explicit note that product has not authorized one and per this ticket's
scope (defects against the three committed tickets only).

## Recommendation

**PASS.** All acceptance criteria for VRTX3-T-0001, VRTX3-T-0002, and
VRTX3-T-0003 are met and independently re-verified against the real built
server, not just unit-test mocks. `bun run verify` is green, the build
succeeds, and the full E2E suite passes with no regressions. Zero defects
found; zero fixes required.

Recommend transitioning VRTX3-S-0001 with `qa.all_acs_passed`.
