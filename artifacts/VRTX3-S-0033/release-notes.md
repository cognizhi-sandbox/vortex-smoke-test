---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0033
idea: VRTX3-I-0040
branch: vortex/sprint/vrtx3-s-0033-c609ec83
upstream: [artifacts/VRTX3-S-0033/qa-test-report.md]
---

# Release notes — VRTX3-S-0033

## Added

- `GET /api/healthz-smoke-189360772-a` answers `200` with `Content-Type: application/json` and body `{"ok":true,"variant":"189360772"}`. (VRTX3-T-0216)
- `GET /api/healthz-smoke-189360772-b` — same response. (VRTX3-T-0217)
- `GET /api/healthz-smoke-189360772-c` — same response. (VRTX3-T-0218)

Each probe answers while authentication and the database are unavailable: it reads no request state and touches no data store. Anyone verifying a deployment can now use three more independent checks that the running build is actually serving the Nitro API. The probe family is now 100 endpoints.

## Upgrade notes

None. The change is purely additive — three new URLs, no existing endpoint, response shape, configuration, dependency or database schema altered, and nothing in the user interface changed. No migration to run and no action required on upgrade.

Note for anyone checking these URLs by hand: an `/api/*` path with no handler returns `200 text/html` (the SPA shell), not `404`, so a status code alone does not tell you whether a probe exists. Assert on the response body and `Content-Type`.

## Not included

Deliberately out of scope per VRTX3-I-0040 and `SPRINT-PLAN.md`, and unchanged by this release: no shared helper, factory or barrel export across the probe family; no non-`GET` method handling, query parameters or request bodies; no dynamic payload fields (uptime, timestamp, version, dependency health); no monitoring, alerting or uptime-check registration; no Playwright coverage for the new probes; and no retirement of older probes. Nothing that was in scope for this sprint failed to ship.

## Verification

Verified at integration QA against the merged sprint branch — see `artifacts/VRTX3-S-0033/qa-test-report.md` (PASS, all nine acceptance criteria, no defects found).

## Compliance / Control Evidence

| Control                        | Evidence                                             | Location                                                   | Status    | Exception |
| ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- | --------- | --------- |
| Release contents recorded      | this file                                            | `artifacts/VRTX3-S-0033/release-notes.md`                  | Satisfied | —         |
| Release verified before land   | QA PASS verdict, 9/9 acceptance criteria             | `artifacts/VRTX3-S-0033/qa-test-report.md`                 | Satisfied | —         |
| End-to-end suite executed      | `E2E-RESULT: chromium 6 passed, 0 failed, 0 skipped` | `artifacts/VRTX3-S-0033/integration-test-result.md`        | Satisfied | —         |
| Known limitations communicated | no open defect; out-of-scope stated above            | `artifacts/VRTX3-S-0033/integration-defects-resolution.md` | Satisfied | —         |
