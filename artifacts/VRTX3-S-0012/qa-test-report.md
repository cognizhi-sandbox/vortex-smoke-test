# QA Test Report — VRTX3-S-0012

- **Sprint:** VRTX3-S-0012
- **Sprint goal:** [smoke] Bugfix sprint smoke-bugfix-178627381829942
- **Date:** 2026-08-09
- **Validation agent:** Vortex Validation (VRTX3-T-0081)

## Executive Summary

Sprint VRTX3-S-0012 delivered three missing `/api/healthz-smoke-*` probe routes
(`healthz-smoke-bugfix-6202295`, `healthz-smoke-bugfix2-433928318`,
`healthz-smoke-bugfix3-196651982`), each expected to return HTTP 200,
`Content-Type: application/json`, and body `{ ok: true, variant: "<id>" }`. All three
tickets (VRTX3-T-0077, VRTX3-T-0078, VRTX3-T-0079) were already squash-merged onto the
sprint branch at handoff. Verification was performed directly against the built
production server (`bun run build` + `bun .output/server/index.mjs`), not against the
dev server or by static inspection, per the repo's own documented gotcha that a missing
`/api/*` route returns `200 text/html` (SPA fallback) rather than `404` — so status code
alone cannot prove a route exists. All three routes are correctly registered and return
the exact expected JSON body and `Content-Type`, distinguishable from a genuinely
missing route control. The full unit suite (117 tests), lint, typecheck, build, and the
full Playwright E2E suite (5 tests) all pass. **No defects found — sprint verdict: PASS.**

## E2E Test Status

Full Playwright suite executed (see `integration-test-result.md` for the complete
command, verbatim output, and per-spec table): **5 passed, 0 failed** in 3.5s across
`e2e/home.spec.ts` and `e2e/smoke.spec.ts`. This sprint added no new UI surface (API-only
probes), so the existing E2E suite serves as a regression check that the sprint's changes
did not break the app shell or the `/api/hello` proxy path.

## Unit Test Results

Command: `bun run test` (→ `NODE_ENV=test bun --bun vitest run`)

```
 Test Files  57 passed (57)
      Tests  117 passed (117)
   Start at  11:22:12
   Duration  2.38s (transform 306ms, setup 254ms, import 776ms, tests 545ms, environment 916ms)
```

All 57 test files / 117 tests pass, including the three new colocated route tests
(`healthz-smoke-bugfix-6202295.test.ts`, `healthz-smoke-bugfix2-433928318.test.ts`,
`healthz-smoke-bugfix3-196651982.test.ts`).

Additionally ran and confirmed clean:

- `bun run lint` (ESLint 10, `--max-warnings 0`) — 0 errors, 0 warnings.
- `bun run typecheck` (`tsc --build`) — clean, no output.
- `bun run build` — succeeded; all three new route modules appear in the compiled
  server output under `.output/server/_routes/api/` (`healthz_smoke_bugfix_6202295.mjs`,
  `healthz_smoke_bugfix2_433928318.mjs`, `healthz_smoke_bugfix3_196651982.mjs`),
  confirming Nitro actually registered the routes (a unit test alone cannot prove this,
  per the repo's own gotcha — it imports the handler module directly).

**Live verification against the built server** (`bun .output/server/index.mjs`, port
3000), asserting on body + `Content-Type` per the repo gotcha, not status code alone:

| Route                                                              | Status | Content-Type                     | Body                                |
| ------------------------------------------------------------------ | ------ | -------------------------------- | ----------------------------------- |
| `/api/healthz-smoke-bugfix-6202295`                                | 200    | `application/json;charset=UTF-8` | `{"ok":true,"variant":"6202295"}`   |
| `/api/healthz-smoke-bugfix2-433928318`                             | 200    | `application/json;charset=UTF-8` | `{"ok":true,"variant":"433928318"}` |
| `/api/healthz-smoke-bugfix3-196651982`                             | 200    | `application/json;charset=UTF-8` | `{"ok":true,"variant":"196651982"}` |
| `/api/healthz-smoke-doesnotexist-999` (control, genuinely missing) | 200    | `text/html; charset=utf-8`       | SPA `index.html` shell              |

The three delivered routes are clearly distinguishable from the missing-route control,
confirming all three acceptance criteria are met on the actual served build.

## Code Review

No notable code-quality concerns observed during verification. Each new handler is a
verbatim copy of the established probe pattern (`defineHandler` returning
`{ ok: true, variant: "<id>" }`), with no shared helper/factory/barrel introduced,
consistent with the repo's documented deliberate-duplication convention for this route
family. No auth or `db/` imports were added, matching the ticket's fixed interface
contract. (Per stack conventions, the absence of explicit `react`/`react-router` imports
elsewhere in the codebase and the absence of `tailwind.config.ts` are expected, not
defects.)

## Coverage Summary

No coverage tool (`@vitest/coverage-v8` / `@vitest/coverage-istanbul`) is installed in
this repo, and `package.json` defines no `coverage` script, so no numeric coverage
percentage is available. What shipped this sprint is fully exercised by other means: each
of the 3 new handlers has a colocated `*.test.ts` (all passing, see Unit Test Results),
and route _registration_ — which a unit test cannot prove — was independently confirmed
via the production build output and a live HTTP request against the built server (table
above). This mirrors the verification depth of every prior probe-family sprint in this
repo's changelog.

## Issues Found

None. All three acceptance criteria (route returns 200, `application/json`, and the
exact `{ ok: true, variant: "<id>" }` body) were verified directly against the built
production server for all three routes. No entries were added to
`integration-defects-resolution.md`.

## Recommendation

**Proceed — fire `validation.all_acs_passed`.** All acceptance criteria verified against
the deployed/built sprint branch; unit tests (117/117), lint, typecheck, build, and the
full E2E suite (5/5) all pass; no defects found.
