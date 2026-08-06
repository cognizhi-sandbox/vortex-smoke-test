# Integration QA Report — VRTX3-S-0007

**Sprint goal:** `[smoke] Bugfix sprint smoke-bugfix-178602042849531` — restore
three missing `/api/healthz-smoke-*` endpoints so each returns its
`{ok, variant}` JSON.

**Ticket:** VRTX3-T-0047 · **Base branch:** `vortex/sprint/vrtx3-s-0007-ba409759`
**Committed tickets:** VRTX3-T-0043, VRTX3-T-0044, VRTX3-T-0045
**Date:** 2026-08-06

---

## Executive Summary

All three committed defects are fixed and verified on the integrated sprint
branch. `bun run verify` (lint + typecheck + unit/integration tests) is green,
the production build (`bun run build`) succeeds and correctly registers all
three new routes, and the full Playwright chromium suite passes 5/5. No
regressions were found in any other route. **Zero defects were logged against
this sprint — no fixes were required from QA**, and no unfixable defects were
filed. Verdict: **PASS — recommend `qa.all_acs_passed`.**

The three tickets' plans flagged that the originally-reported symptom ("returns
404") does not reproduce — unmatched `/api/*` paths return `200 text/html` via
the SPA fallback both before and after the fix. QA independently reproduced
this against the built production server (see Code Review) and confirms the
tickets' acceptance criteria were correctly written to assert on response body
and `Content-Type: application/json` rather than status code, which is the
only way this defect class is actually verifiable.

## E2E Test Status

Full Playwright chromium suite executed against the dev server per
`playwright.config.ts` (`bun x vite --port 5178 --strictPort`).
Command: `bun run test:e2e -- --project=chromium`.

Real stdout (see `integration-test-result.md` for the complete capture):

```
Running 5 tests using 4 workers

  ✓  2 [chromium] › e2e/home.spec.ts:14:3 › Home page › shows the hero content and desktop nav (411ms)
  ✓  4 [chromium] › e2e/smoke.spec.ts:13:1 › home page loads with no console errors (504ms)
  ✓  1 [chromium] › e2e/home.spec.ts:27:3 › Home page › has no vertical scrollbar on common viewport sizes (609ms)
  ✓  3 [chromium] › e2e/home.spec.ts:44:3 › Home page › opens and closes the mobile nav from the hamburger button (634ms)
  ✓  5 [chromium] › e2e/smoke.spec.ts:26:1 › the API responds (325ms)

  5 passed (3.8s)
```

`E2E-RESULT: chromium 5 passed, 0 failed`

The existing E2E suite does not target the new `healthz-smoke-*` routes
directly (by repo convention these are covered by route-level `H3Event`
integration tests, not Playwright specs — see Unit Test Results). QA
additionally exercised the three new endpoints against the **built production
server** (`bun .output/server/index.mjs`) as an acceptance-criterion check,
documented under Code Review below.

## Unit Test Results

Command: `bun run test` → `NODE_ENV=test bun --bun vitest run`

```
 Test Files  45 passed (45)
      Tests  96 passed (96)
   Duration  2.08s
```

All 45 test files pass, including the three new route tests added by this
sprint:

| Test file                                            | Result        |
| ---------------------------------------------------- | ------------- |
| `routes/api/healthz-smoke-bugfix-534542341.test.ts`  | ✅ 2/2 passed |
| `routes/api/healthz-smoke-bugfix2-279986033.test.ts` | ✅ 2/2 passed |
| `routes/api/healthz-smoke-bugfix3-605591646.test.ts` | ✅ 2/2 passed |

Each asserts the exact `{ ok: true, variant: "<id>" }` body via a real
`H3Event` (not a mock) and a <100ms response-time bound, matching the
established repo pattern (`routes/api/healthz-smoke-bugfix3-764107669.test.ts`
and siblings).

## Code Review

Reviewed the diff introduced by VRTX3-T-0043/0044/0045 (6 new files, 0 files
modified):

- `routes/api/healthz-smoke-bugfix-534542341.ts` / `.test.ts`
- `routes/api/healthz-smoke-bugfix2-279986033.ts` / `.test.ts`
- `routes/api/healthz-smoke-bugfix3-605591646.ts` / `.test.ts`

Each handler is a minimal `defineHandler` from `"nitro/h3"` returning a static
literal object, context-free (does not read `event.context`, consistent with
the plan's instruction to avoid coupling to `middleware/auth.ts`). Each is a
verbatim structural copy of its nearest sibling with only the variant string
changed — no shared/parameterised helper was introduced, matching the
project's explicit convention (~40 independent self-contained handlers) and
the plan's explicit instruction not to refactor. No existing file was touched,
so blast radius is zero for every other route.

**Independent re-verification of the acceptance criteria against the real
production build** (not just the unit test mocks), run by QA:

```
$ bun run build          # tsc --build && vite build — succeeded, 0 errors
$ bun .output/server/index.mjs &
$ curl -s -D - http://localhost:3000/api/healthz-smoke-bugfix-534542341
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"534542341"}

$ curl -s -D - http://localhost:3000/api/healthz-smoke-bugfix2-279986033
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"279986033"}

$ curl -s -D - http://localhost:3000/api/healthz-smoke-bugfix3-605591646
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
{"ok":true,"variant":"605591646"}

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
expected for a static healthz literal). No refactor risk introduced. `AGENT.md`
already carries the dated changelog entry for this sprint (added by the
engineering tickets), consistent with the repo convention that observable
behavior changes get documented.

## Coverage Summary

No coverage-instrumentation tool (v8/istanbul) is configured in this repo, so
coverage is reported by file/route accounting rather than line percentage:

- `routes/api/*.ts` handlers: **41/41** have a matching `*.test.ts` (100%),
  including all 3 new handlers from this sprint.
- `src/` unit/component tests: 4 test files (utils + components), unchanged
  by this sprint — no source in `src/` was touched.
- Total suite: 45 test files, 96 tests, all passing.
- E2E: 5/5 Playwright specs passing (home page + smoke, unchanged by this
  sprint's scope — no UI/frontend files were touched).

Gaps (pre-existing, out of scope for this bugfix sprint, noted for
transparency, and explicitly called out as follow-ups in `SPRINT-PLAN.md`):
there is no negative-path test anywhere asserting an unknown `/api/*` path is
_not_ JSON, so a future route deletion/rename would go silently undetected.

## Issues Found

**None within this sprint's scope.** All three defects fixed correctly, no
regressions, no flaky tests observed across the full run (lint, typecheck,
unit/integration tests, build, and Playwright E2E).

Two pre-existing, out-of-scope observations carried over from the sprint plan
(not new defects introduced by this sprint, not fixed here per plan guidance
to avoid scope creep in a bugfix sprint):

1. Unmatched `/api/*` paths resolve to the SPA fallback (`200 text/html`)
   instead of a JSON `404`. This is a router/fallback-precedence issue
   affecting every mistyped or nonexistent API path, and is what caused the
   original defect reports to inaccurately describe a "404" symptom.
   `SPRINT-PLAN.md` Follow-ups explicitly notes product has not authorized a
   DEFECT ticket for this. QA concurs this is a separate concern from the
   three committed defects and does not block this sprint.
2. `routes/api/` now holds 41 near-duplicated healthz handlers. A
   parameterised route would collapse them, but this is a refactor explicitly
   out of scope for a bugfix sprint per repo convention.

Neither item is filed as a DEFECT ticket by QA, per the sprint plan's
explicit note that product has not authorized one and per this ticket's
scope (defects against the three committed tickets only).

## Recommendation

**PASS.** All acceptance criteria for VRTX3-T-0043, VRTX3-T-0044, and
VRTX3-T-0045 are met and independently re-verified against the real built
server, not just unit-test mocks. `bun run verify` is green, the build
succeeds, and the full E2E suite passes with no regressions. Zero defects
found; zero fixes required.

Recommend transitioning VRTX3-S-0007 with `qa.all_acs_passed`.
