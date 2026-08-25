---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0038
idea: VRTX3-I-0047
change: vrtx3-i-0047-smoke-178761821653473-3-independent-endpoints-99
branch: vortex/sprint/vrtx3-s-0038-099d395a
upstream: [artifacts/VRTX3-S-0038/qa-test-report.md]
---

# Release notes — VRTX3-S-0038

## Added

- `GET /api/healthz-smoke-992401223-a` answers `200` with `Content-Type: application/json` and body `{"ok":true,"variant":"992401223"}`. (VRTX3-T-0252)
- `GET /api/healthz-smoke-992401223-b` — same contract, same body. (VRTX3-T-0253)
- `GET /api/healthz-smoke-992401223-c` — same contract, same body. (VRTX3-T-0254)

The `variant` value is the same literal string on all three; it identifies the trio, not the individual endpoint.

Each probe answers while authentication and the database are unavailable. The handler takes no `event` parameter at all, so it cannot read a query string, a header, a request body or `event.context.user`, and it imports nothing from `db/`. The same request twice returns byte-identical JSON. Anyone verifying a deployment has three more independent checks that the running build is actually serving the Nitro API. The probe family is now 121 endpoints.

## Changed

Nothing. No existing endpoint, response shape, configuration, dependency or database schema was altered, and nothing in the user interface changed. The release adds six files under `routes/api/` and modifies none — 66 insertions, 0 deletions (`git diff --stat b6ed89f 0bd6c98 -- . ':!artifacts' ':!openspec'`).

## Upgrade notes

None. The change is purely additive — three URLs that previously had no handler now have one. No migration to run and no action required on upgrade.

Note for anyone checking these URLs by hand: an `/api/*` path with no handler returns `200 text/html` (the 949-byte SPA shell), not `404`, so a status code alone does not tell you whether a probe exists. Assert on the response body and `Content-Type`. Before this release all three of these paths answered `200` with the HTML shell — measured, not assumed.

## Not included

Deliberately out of scope per `SPRINT-PLAN.md` and the change's `design.md`, and unchanged by this release: no shared helper, factory, constants file or barrel export across the probe family; no authentication, rate limiting or access control; no non-`GET` method handling, query parameters or request bodies; no real health signalling — the body is a fixed constant and checks no database, disk or downstream service; no monitoring, alerting or OpenAPI registration; no Playwright coverage for the three new probes; and no retirement of older probes.

Two items were recorded as observations rather than shipped: the 47 existing probe tests that still carry a flaky wall-clock assertion, and the absence of E2E coverage for any probe. Neither is a regression and neither blocks this release. Nothing that was in scope for this sprint failed to ship.

## Verification

Verified at integration QA against the merged sprint branch — see `artifacts/VRTX3-S-0038/qa-test-report.md` (**PASS**, all three probes, no defects found). All three URLs were called against a running server rather than inspected in source, response invariance was checked across query and header variation, and the production build was confirmed to emit the corresponding modules under `.output/server/_routes/api/` with no test files bundled.

Re-confirmed at close on the merged branch: `bun run verify` exits `0` — lint clean at `--max-warnings 0`, typecheck clean, **128 test files / 188 tests passing**, three more files than the pre-release baseline of 125.

## Compliance / Control Evidence

| Control                          | Evidence                                              | Location                                                      | Status    | Exception |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- | --------- | --------- |
| Release contents recorded        | this file                                             | `artifacts/VRTX3-S-0038/release-notes.md`                     | Satisfied | —         |
| Release verified before land     | QA PASS verdict, all three probes                     | `artifacts/VRTX3-S-0038/qa-test-report.md`                    | Satisfied | —         |
| End-to-end suite executed        | `chromium 6 passed, 0 failed, 0 skipped`              | `artifacts/VRTX3-S-0038/integration-test-result.md`           | Satisfied | —         |
| Behaviour specified before build | 3 requirements / 15 scenarios, strict validation pass | `openspec/changes/vrtx3-i-0047-…/specs/health-probes/spec.md` | Satisfied | —         |
| Known limitations communicated   | no open defect; out-of-scope stated above             | `artifacts/VRTX3-S-0038/integration-defects-resolution.md`    | Satisfied | —         |
