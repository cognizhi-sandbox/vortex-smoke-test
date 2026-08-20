---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0028
idea: VRTX3-I-0037
branch: vortex/sprint/vrtx3-s-0028-2cacd19c
upstream: [artifacts/VRTX3-S-0028/qa-test-report.md]
---

# Release notes — VRTX3-S-0028

## Added

- Three new health check endpoints are live, each answering `200` with `Content-Type: application/json` and the body `{ "ok": true, "variant": "458730798" }`. No credentials are required — an unauthenticated poll succeeds.
  - `GET /api/healthz-smoke-458730798-a` (VRTX3-T-0197)
  - `GET /api/healthz-smoke-458730798-b` (VRTX3-T-0198)
  - `GET /api/healthz-smoke-458730798-c` (VRTX3-T-0199)

  Each is independent of the other two and of the rest of the application: no auth check, no database access, no shared module. A failing poll means the server is not serving its API, not that some dependency behind it is down. Monitoring can hit any of the three, or all three, as a liveness surface. The health probe family now numbers 95.

## Upgrade notes

None. The change is purely additive — six new files, no existing behaviour altered, no configuration change, no migration, no new dependency, and nothing added to the web UI.

## Not included

- **Latency is not asserted per handler.** The idea asked for a "returns in under 100 ms" check inside each endpoint's unit test. It was deliberately not implemented: a wall-clock assertion on a shared CI runner is a flake source and proves nothing about the response. The property it aimed at — the handler does no I/O — is instead guaranteed structurally, since each endpoint imports only the HTTP framework and touches no database or auth code. See `sprint-summary.md` § Divergence from plan.
- **Non-`GET` methods are unspecified.** `POST`, `PUT` and `DELETE` to these paths return the same `200` body as `GET`, consistent with every other probe in the family. This was out of scope for the idea and no method-specific behaviour was added.
- **No browser E2E coverage for the new endpoints**, per the idea's scope. They are covered by unit tests and by live request verification at integration QA.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0028/qa-test-report.md` (**PASS**, all 9 acceptance criteria, zero defects found).

## Compliance / Control Evidence

| Control                                 | Evidence                                                                  | Location                                   | Status    | Exception |
| --------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded               | this file                                                                 | `artifacts/VRTX3-S-0028/release-notes.md`  | Satisfied | —         |
| Release verified before land            | QA PASS verdict, all 9 acceptance criteria                                | `artifacts/VRTX3-S-0028/qa-test-report.md` | Satisfied | —         |
| Changes traceable to authorized tickets | Every entry carries its ticket key; all tickets DONE                      | ticket table in `…/sprint-summary.md`      | Satisfied | —         |
| Known limitations communicated          | § Not included — dropped latency assertion, unspecified non-`GET` methods | this file                                  | Satisfied | —         |
| Breaking changes / migrations disclosed | None introduced; additive only, no config or schema change                | § Upgrade notes                            | Satisfied | —         |
