---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0027
idea: VRTX3-I-0036
branch: vortex/sprint/vrtx3-s-0027-bc93e1fe
upstream: [artifacts/VRTX3-S-0027/qa-test-report.md]
---

# Release notes — VRTX3-S-0027

## Added

- `GET /api/healthz-smoke-868033827-a` — returns `200` with `Content-Type: application/json` and body `{"ok":true,"variant":"868033827"}`. No credentials, no setup: callable from anywhere to confirm the deployed build is serving the Nitro API. (VRTX3-T-0189)
- `GET /api/healthz-smoke-868033827-b` — same contract, independently deployable. (VRTX3-T-0190)
- `GET /api/healthz-smoke-868033827-c` — same contract, independently deployable. (VRTX3-T-0191)

All three answer every HTTP verb with the same `200` body, consistent with the other 89 probes in the family — a non-`GET` request is not rejected.

## Upgrade notes

None. The three endpoints are new paths; no existing route, response shape, configuration, dependency or database schema changed, and nothing requires migration or a feature flag. Deployments that do not call the new paths see no difference.

## Not included

- No authentication, authorization or rate limiting on the probes, and no HTTP method restriction — all explicitly out of scope in VRTX3-I-0036.
- No Playwright end-to-end coverage for the new endpoints; `e2e/smoke.spec.ts` is untouched. They are verified by their colocated unit tests and by live request at integration QA.
- No monitoring, alerting, OpenAPI documentation or README entry for the new probes.
- No user interface change of any kind — nothing in `src/` was touched.

## Verification

Verified at integration QA on the merged sprint branch — see `artifacts/VRTX3-S-0027/qa-test-report.md` (PASS, all 8 acceptance criteria, no defects found).

## Compliance / Control Evidence

| Control                        | Evidence                                                        | Location                                                   | Status    | Exception |
| ------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------- | --------- | --------- |
| Release contents recorded      | This file — three added endpoints, each traced to its ticket    | `artifacts/VRTX3-S-0027/release-notes.md`                  | Satisfied | —         |
| Release verified before land   | QA PASS verdict, live endpoint checks on the integrated branch  | `artifacts/VRTX3-S-0027/qa-test-report.md`                 | Satisfied | —         |
| Known limitations communicated | `## Not included` set against the plan's declared scope         | this file, `artifacts/VRTX3-S-0027/SPRINT-PLAN.md` § Scope | Satisfied | —         |
| Breaking changes assessed      | None introduced — purely additive, six new files, zero modified | `artifacts/VRTX3-S-0027/sprint-summary.md` § What shipped  | Satisfied | —         |
