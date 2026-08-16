---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0024
idea: VRTX3-I-0033
branch: vortex/sprint/vrtx3-s-0024-e6a9735d
upstream: [artifacts/VRTX3-S-0024/qa-test-report.md]
---

# Release notes — VRTX3-S-0024

## Fixed

- `GET /api/healthz-smoke-bugfix-27681476` now answers with `{"ok":true,"variant":"27681476"}` as
  JSON. It previously returned the single-page-app HTML shell, because the endpoint had never been
  built. (VRTX3-T-0167)
- `GET /api/healthz-smoke-bugfix2-107364458` now answers with
  `{"ok":true,"variant":"107364458"}` as JSON, same cause. (VRTX3-T-0168)
- `GET /api/healthz-smoke-bugfix3-351014898` now answers with
  `{"ok":true,"variant":"351014898"}` as JSON, same cause. (VRTX3-T-0169)

All three take the health-probe family from 83 endpoints to 86. Each responds independently of
authentication and of the database, so it stays answerable when either is unavailable.

**Worth knowing if you are monitoring these endpoints:** all three were reported as returning `404`.
They never did. An unrecognised `/api/*` path is answered by the app shell with `200 text/html`, so
a probe that does not exist looks healthy to any check that only reads the status code. Assert on
the response body and `Content-Type` instead.

## Upgrade notes

None. The release is additive — three new endpoints, no existing endpoint, page or stored data
changed, no migration, no configuration or feature-flag change, and no new dependency. Nothing
needs to be done to adopt it.

## Not included

Nothing planned for this sprint was left out. Non-`GET` method handling on the probe family remains
deliberately out of scope, as it has been since the family was introduced: these endpoints answer
every HTTP verb with the same body by design, and adding a `405` to three of 86 would make them
inconsistent with the rest.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0024/qa-test-report.md` (PASS): all three
endpoints checked live against the integrated branch on body and `Content-Type`, alongside a known-good
control endpoint, with the full unit and end-to-end suites green.

## Compliance / Control Evidence

| Control                        | Evidence                                        | Location                                   | Status    | Exception |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded      | this file                                       | `artifacts/VRTX3-S-0024/release-notes.md`  | Satisfied | —         |
| Release verified before land   | QA PASS verdict, live-endpoint evidence table   | `artifacts/VRTX3-S-0024/qa-test-report.md` | Satisfied | —         |
| Known limitations communicated | SPA-fallback caveat and out-of-scope note above | this file                                  | Satisfied | —         |
| No open defects at release     | 0 found at integration QA                       | `…/integration-defects-resolution.md`      | Satisfied | —         |
