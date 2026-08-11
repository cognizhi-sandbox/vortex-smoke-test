---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0020
idea: VRTX3-I-0029
branch: vortex/sprint/vrtx3-s-0020-19823fbf
upstream: [artifacts/VRTX3-S-0020/qa-test-report.md]
---

# Release notes — VRTX3-S-0020

## Fixed

- `GET /api/healthz-smoke-bugfix-1060413982` now answers with the health-probe JSON body
  `{"ok":true,"variant":"1060413982"}` instead of falling through to the single-page-app shell.
  (VRTX3-T-0137)
- `GET /api/healthz-smoke-bugfix2-521525844` now answers with
  `{"ok":true,"variant":"521525844"}`. (VRTX3-T-0138)
- `GET /api/healthz-smoke-bugfix3-287868165` now answers with
  `{"ok":true,"variant":"287868165"}`. (VRTX3-T-0139)

All three behave like every other probe in the family: HTTP 200,
`Content-Type: application/json`, no authentication, and answerable while the database is
unavailable. The family now numbers 74 probes.

**Note for anyone monitoring these endpoints:** before this release these paths returned
**`200 text/html`** (the SPA shell), not `404` — an unmatched `/api/*` path has always been served
by the app shell. A monitor that checked only the status code would have reported these three as
healthy the whole time. Check the response body or `Content-Type`, not the status code.

## Upgrade notes

None. Purely additive — three new endpoints, no existing endpoint, configuration, dependency or
database schema changed, and no migration to run.

## Not included

Nothing from the sprint's scope was left out; all three committed defects shipped. Consistent with
the probe family's documented scope, these endpoints have no authentication, no custom handling for
non-`GET` methods (every verb returns the same body), no request parameters, and no dedicated
end-to-end coverage.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0020/qa-test-report.md` (PASS, no defects
found).

## Compliance / Control Evidence

| Control                      | Evidence                                    | Location                                   | Status    | Exception |
| ---------------------------- | ------------------------------------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file                                   | `artifacts/VRTX3-S-0020/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict, live per-endpoint requests | `artifacts/VRTX3-S-0020/qa-test-report.md` | Satisfied | —         |
| Known limitations disclosed  | `## Not included`, status-code note above   | this file                                  | Satisfied | —         |
