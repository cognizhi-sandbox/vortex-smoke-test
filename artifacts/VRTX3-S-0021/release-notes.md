---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0021
idea: VRTX3-I-0030
branch: vortex/sprint/vrtx3-s-0021-66a28084
upstream: [artifacts/VRTX3-S-0021/qa-test-report.md]
---

# Release notes — VRTX3-S-0021

## Added

- `GET /api/healthz-smoke-568557289-a` now answers `200 application/json` with
  `{"ok":true,"variant":"568557289"}`. (VRTX3-T-0146)
- `GET /api/healthz-smoke-568557289-b` — same contract, same body. (VRTX3-T-0147)
- `GET /api/healthz-smoke-568557289-c` — same contract, same body. (VRTX3-T-0148)

All three are unauthenticated and answer on any HTTP verb, consistent with the rest of the
`/api/healthz-smoke-*` family (now 77 probes). They read no request state and touch neither auth
nor the database, so they stay answerable when those are unavailable.

## Not included

Per the scope set in `SPRINT-PLAN.md` and the idea's out-of-scope list:

- No Playwright/E2E spec for the new probes — they are covered by their colocated Vitest tests and
  live HTTP checks, matching every prior probe sprint.
- No observability wiring — these are not registered with any uptime monitor, dashboard or alert.
- No method guard or input validation on the new paths, and no `405` behaviour.
- No retirement of older probes, and no removal of the flaky `responds in under 100ms` assertion
  from the 47 pre-VRTX3-S-0011 probe tests. Both remain open questions needing a human decision.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0021/qa-test-report.md` (PASS, zero defects).

## Compliance / Control Evidence

| Control / policy             | Evidence produced                       | Location                                           | Status    | Exception |
| ---------------------------- | --------------------------------------- | -------------------------------------------------- | --------- | --------- |
| Release contents recorded    | this file                               | `artifacts/VRTX3-S-0021/release-notes.md`          | Satisfied | —         |
| Release verified before land | QA PASS verdict, 0 defects              | `artifacts/VRTX3-S-0021/qa-test-report.md`         | Satisfied | —         |
| Known limitations disclosed  | `## Not included`, set against the plan | this file, `artifacts/VRTX3-S-0021/SPRINT-PLAN.md` | Satisfied | —         |
