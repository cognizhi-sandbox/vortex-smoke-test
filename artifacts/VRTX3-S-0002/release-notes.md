---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0002
idea: VRTX3-I-0005 (VRTX3-T-0009 only; VRTX3-T-0007 and VRTX3-T-0008 have none linked)
branch: vortex/sprint/vrtx3-s-0002-4688bb08
upstream: [artifacts/VRTX3-S-0002/qa-test-report.md]
---

# Release notes — VRTX3-S-0002

## Fixed

- `GET /api/healthz-smoke-bugfix-158202122` now answers `200` with `Content-Type: application/json`
  and body `{"ok":true,"variant":"158202122"}`. It previously returned no probe response at all.
  (VRTX3-T-0007)
- `GET /api/healthz-smoke-bugfix2-142310404` now answers `200` with `Content-Type: application/json`
  and body `{"ok":true,"variant":"142310404"}`. (VRTX3-T-0008)
- `GET /api/healthz-smoke-bugfix3-834560860` now answers `200` with `Content-Type: application/json`
  and body `{"ok":true,"variant":"834560860"}`. (VRTX3-T-0009)

All three were reported as returning `404`. They did not: an `/api/*` path with no handler falls
through to the single-page-app HTML shell and answers `200 text/html`. **If you monitor these probes,
assert on the response body and `Content-Type`, not the status code** — a status-only health check
passes against an endpoint that does not exist. This applies to every probe in the family, not only
the three fixed here.

The health probe family now numbers 103 endpoints.

## Upgrade notes

None. The change is purely additive — three new endpoints, no existing endpoint altered, no
migration, no configuration change, no feature flag, no new dependency, and nothing removed.

## Not included

Nothing in the sprint's scope was dropped; all three committed defects shipped. Deliberately out of
scope, unchanged from the family's existing behaviour: these probes accept any HTTP verb and return
the same `200` body for `POST`, `PUT` and `DELETE` as for `GET` — no method guard was added, because
none of the 100 sibling probes declares one. Authentication, request parameters and observability
wiring remain out of scope for the probe family.

## Verification

Verified at integration QA against the built and running integrated branch — see
`artifacts/VRTX3-S-0002/qa-test-report.md` (PASS, zero defects).

## Compliance / Control Evidence

| Control                      | Evidence                              | Location                                                   | Status    | Exception |
| ---------------------------- | ------------------------------------- | ---------------------------------------------------------- | --------- | --------- |
| Release contents recorded    | this file                             | `artifacts/VRTX3-S-0002/release-notes.md`                  | Satisfied | —         |
| Release verified before land | QA PASS verdict                       | `artifacts/VRTX3-S-0002/qa-test-report.md`                 | Satisfied | —         |
| Known limitations disclosed  | Method-agnostic behaviour under scope | `## Not included` above                                    | Satisfied | —         |
| No open defects at release   | 0 found at integration                | `artifacts/VRTX3-S-0002/integration-defects-resolution.md` | Satisfied | —         |
