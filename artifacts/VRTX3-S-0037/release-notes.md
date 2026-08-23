---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0037
idea: VRTX3-I-0044
branch: vortex/sprint/vrtx3-s-0037-3cd6b387
upstream: [artifacts/VRTX3-S-0037/qa-test-report.md]
---

# Release notes — VRTX3-S-0037

## Fixed

- `GET /api/healthz-smoke-bugfix-147016547` now answers `200` with `Content-Type: application/json` and body `{"ok":true,"variant":"147016547"}`. Previously unreachable. (VRTX3-T-0243)
- `GET /api/healthz-smoke-bugfix2-386341015` — same, body `{"ok":true,"variant":"386341015"}`. (VRTX3-T-0244)
- `GET /api/healthz-smoke-bugfix3-1025161533` — same, body `{"ok":true,"variant":"1025161533"}`. (VRTX3-T-0245)

All three were reported as returning `404`. They did not: the handler files had never been written, and an `/api/*` path with no handler is answered by the SPA shell, not by an error. The endpoints were genuinely missing, which is what the reports were right about; the fix is the same either way.

Each probe answers while authentication and the database are unavailable — it takes no request parameter at all, so it reads no request state and touches no data store. Anyone verifying a deployment has three more independent checks that the running build is actually serving the Nitro API. The probe family is now 118 endpoints.

## Changed

Nothing. No existing endpoint, response shape, configuration, dependency or database schema was altered, and nothing in the user interface changed. The release adds six files and modifies none.

## Upgrade notes

None. The change is purely additive — three URLs that previously had no handler now have one. No migration to run and no action required on upgrade.

Note for anyone checking these URLs by hand: an `/api/*` path with no handler returns `200 text/html` (the 949-byte SPA shell), not `404`, so a status code alone does not tell you whether a probe exists. Assert on the response body and `Content-Type`. That is exactly what made these three defects easy to misreport — before this release all three answered `200` with the HTML shell.

## Not included

Deliberately out of scope per `SPRINT-PLAN.md`, and unchanged by this release: no shared helper, factory, constants file or barrel export across the probe family; no authentication, rate limiting or access control; no non-`GET` method handling, query parameters or request bodies; no real health signalling — the body is a fixed constant and checks no database, disk or downstream service; no monitoring, alerting or OpenAPI registration; no Playwright coverage for the restored probes; and no retirement of older probes.

Two items were recorded as follow-ups rather than shipped: the upstream `404` mis-transcription in defect capture, which originates outside this repository, and the 47 existing probe tests that still carry a flaky wall-clock assertion. Neither is a regression and neither blocks this release. Nothing that was in scope for this sprint failed to ship.

## Verification

Verified at integration QA against the merged sprint branch — see `artifacts/VRTX3-S-0037/qa-test-report.md` (PASS, all three defects, no defects found). All three URLs were called against a running server, not inspected in source, and the production build was confirmed to emit the corresponding modules under `.output/server/_routes/api/` with no test files bundled. Re-confirmed at close: `bun run verify` exits `0` with 125 test files / 185 tests passing, three more of each than the pre-release baseline of 122 / 182.

## Compliance / Control Evidence

| Control                        | Evidence                                             | Location                                                   | Status    | Exception |
| ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- | --------- | --------- |
| Release contents recorded      | this file                                            | `artifacts/VRTX3-S-0037/release-notes.md`                  | Satisfied | —         |
| Release verified before land   | QA PASS verdict, all three defects                   | `artifacts/VRTX3-S-0037/qa-test-report.md`                 | Satisfied | —         |
| End-to-end suite executed      | `E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped` | `artifacts/VRTX3-S-0037/integration-test-result.md`        | Satisfied | —         |
| Known limitations communicated | no open defect; out-of-scope stated above            | `artifacts/VRTX3-S-0037/integration-defects-resolution.md` | Satisfied | —         |
