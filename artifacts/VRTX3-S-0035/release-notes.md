---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0035
idea: VRTX3-I-0042
branch: vortex/sprint/vrtx3-s-0035-b613a5d1
upstream: [artifacts/VRTX3-S-0035/qa-test-report.md]
---

# Release notes — VRTX3-S-0035

## Added

- `GET /api/healthz-smoke-180848429-a` answers `200` with `Content-Type: application/json` and body `{"ok":true,"variant":"180848429"}`. (VRTX3-T-0230)
- `GET /api/healthz-smoke-180848429-b` — same response. (VRTX3-T-0231)
- `GET /api/healthz-smoke-180848429-c` — same response. (VRTX3-T-0232)

Each probe answers while authentication and the database are unavailable: it takes no request parameter at all, so it reads no request state and touches no data store. Anyone verifying a deployment can now use three more independent checks that the running build is actually serving the Nitro API. The probe family is now 112 endpoints.

## Upgrade notes

None. The change is purely additive — three new URLs, no existing endpoint, response shape, configuration, dependency or database schema altered, and nothing in the user interface changed. No migration to run and no action required on upgrade.

Note for anyone checking these URLs by hand: an `/api/*` path with no handler returns `200 text/html` (the SPA shell), not `404`, so a status code alone does not tell you whether a probe exists. Assert on the response body and `Content-Type`. This applies to the URLs above as much as to any other — before this release they answered `200` with the 949-byte HTML shell.

## Not included

Deliberately out of scope per VRTX3-I-0042 and `SPRINT-PLAN.md`, and unchanged by this release: no shared helper, factory, constants file or barrel export across the probe family; no authentication, rate limiting or caching headers; no non-`GET` method handling, query parameters or request bodies; no dynamic payload fields (uptime, timestamp, version, dependency health); no monitoring, alerting or uptime-check registration; no Playwright coverage for the new probes; and no retirement of older probes. Nothing that was in scope for this sprint failed to ship.

## Verification

Verified at integration QA against the merged sprint branch — see `artifacts/VRTX3-S-0035/qa-test-report.md` (PASS, all eight acceptance criteria, no defects found). All three URLs were called against the built `.output` server, not inspected in source. Re-confirmed at close: `bun run verify` exits `0` with 119 test files / 179 tests passing.

## Compliance / Control Evidence

| Control                        | Evidence                                             | Location                                                   | Status    | Exception |
| ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- | --------- | --------- |
| Release contents recorded      | this file                                            | `artifacts/VRTX3-S-0035/release-notes.md`                  | Satisfied | —         |
| Release verified before land   | QA PASS verdict, 8/8 acceptance criteria             | `artifacts/VRTX3-S-0035/qa-test-report.md`                 | Satisfied | —         |
| End-to-end suite executed      | `E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped` | `artifacts/VRTX3-S-0035/integration-test-result.md`        | Satisfied | —         |
| Known limitations communicated | no open defect; out-of-scope stated above            | `artifacts/VRTX3-S-0035/integration-defects-resolution.md` | Satisfied | —         |
