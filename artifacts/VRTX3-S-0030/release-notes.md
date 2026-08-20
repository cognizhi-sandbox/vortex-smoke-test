---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0030
idea: none-linked
branch: vortex/sprint/vrtx3-s-0030-e2c3a0d0
upstream: [artifacts/VRTX3-S-0030/qa-test-report.md]
---

# Release notes — VRTX3-S-0030

## Fixed

- `GET /api/healthz-smoke-bugfix-ha-853006542` now answers with `{"ok":true,"variant":"853006542"}`
  as JSON. It previously returned the single-page-app HTML shell, because the endpoint had never
  been built. (VRTX3-T-0206)
- `GET /api/healthz-smoke-bugfix-ha2-165600260` now answers with
  `{"ok":true,"variant":"165600260"}` as JSON, same cause. (VRTX3-T-0207)

Both take the health-probe family from 95 endpoints to 97. Each responds independently of
authentication and of the database, so it stays answerable when either is unavailable.

**Worth knowing if you are monitoring these endpoints — two things, and both change what a check
should assert.**

First, both were reported as returning `404`. They never did. An unrecognised `/api/*` path is
answered by the app shell with `200 text/html`, so a probe that does not exist looks healthy to any
check that only reads the status code. Assert on the response body and `Content-Type` instead.

Second, both defect reports named the endpoint **without** its `/api/` prefix — as
`/healthz-smoke-bugfix-ha-853006542` and `/healthz-smoke-bugfix-ha2-165600260`. Those spellings are
not the endpoints and still return the app shell. Every probe in the family is served under `/api/`
and nowhere else, so a monitor pointed at the prefix-less path will report a permanent failure
against a healthy service.

## Upgrade notes

None. The release is additive — two new endpoints, no existing endpoint, page or stored data
changed, no migration, no configuration or feature-flag change, and no new dependency. Nothing needs
to be done to adopt it.

## Not included

Nothing planned for this sprint was left out.

Two things stay deliberately out of scope. Non-`GET` method handling on the probe family is
unchanged: these endpoints answer every HTTP verb with the same body by design, and adding a `405`
to two of 97 would make them inconsistent with the rest. Serving probes at prefix-less paths is also
not part of this release — the `/api/` prefix is the published contract, and the reports that dropped
it were mislabelled rather than describing a second defect.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0030/qa-test-report.md` (PASS): both endpoints
checked live against the integrated branch on body and `Content-Type`, alongside a known-good
control endpoint, with the full unit suite (164 tests), the build, and the end-to-end suite (6/6, no
skips) green. Re-checked once more during sprint close; readings are recorded in the Reviewer note
at the top of `artifacts/VRTX3-S-0030/sprint-summary.md`.

## Compliance / Control Evidence

| Control                        | Evidence                                                                    | Location                                   | Status    | Exception |
| ------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded      | this file                                                                   | `artifacts/VRTX3-S-0030/release-notes.md`  | Satisfied | —         |
| Release verified before land   | QA PASS verdict, live-endpoint evidence table                               | `artifacts/VRTX3-S-0030/qa-test-report.md` | Satisfied | —         |
| Known limitations communicated | SPA-fallback caveat, `/api/` prefix caveat, and the out-of-scope note above | this file                                  | Satisfied | —         |
| No open defects at release     | 0 found at integration QA                                                   | `…/integration-defects-resolution.md`      | Satisfied | —         |
