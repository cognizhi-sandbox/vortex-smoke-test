---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0022
idea: VRTX3-I-0031
branch: vortex/sprint/vrtx3-s-0022-48993fb6
upstream: [artifacts/VRTX3-S-0022/qa-test-report.md]
---

# Release notes — VRTX3-S-0022

_2026-08-11_

## Added

- `GET /api/healthz-smoke-600965021-a` now answers with a JSON health response —
  `{"ok":true,"variant":"600965021"}` — instead of the SPA HTML shell. (VRTX3-T-0154)
- `GET /api/healthz-smoke-600965021-b` — same response. (VRTX3-T-0155)
- `GET /api/healthz-smoke-600965021-c` — same response. (VRTX3-T-0156)

All three answer without auth and without a database, so they stay usable as liveness probes when
those are unavailable. Probe family: 77 → 80 endpoints.

## Upgrade notes

No action required. The release is purely additive — three new paths that previously fell through to
the SPA shell. No migration, no configuration change, no feature flag, and no change to any existing
route, page or response.

Note for anyone wiring a monitor to these: check the response **body and `Content-Type`**, not the
status code. An unregistered `/api/*` path on this service returns `200 text/html` (the SPA shell),
so a status-code-only check passes whether or not the endpoint exists.

## Not included

Deliberately out of scope for this release, per the idea's own scope statement:

- No Playwright/E2E coverage for the new probes — colocated integration tests are the tier this
  family uses.
- No shared handler, factory or constants module across the probes; the duplication is intentional.
- No HTTP method guard — as with every existing probe, non-`GET` verbs return the same 200 body.
- No extra response fields (timestamp, uptime, version, dependency roll-up).
- No retirement of older probes, and no cleanup of the 47 pre-existing probe tests that carry a
  wall-clock timing assertion.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0022/qa-test-report.md` (PASS, zero defects).

## Compliance / Control Evidence

| Control                      | Evidence produced                                          | Location                                   | Status    | Exception |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file                                                  | `artifacts/VRTX3-S-0022/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict on integrated branch `92d469b`             | `artifacts/VRTX3-S-0022/qa-test-report.md` | Satisfied | —         |
| Known limitations disclosed  | `## Not included` — scope exclusions carried from the idea | this file                                  | Satisfied | —         |
| Breaking changes assessed    | None — additive only, 0 existing source files modified     | `git diff 85409cb..HEAD --stat`            | Satisfied | —         |
