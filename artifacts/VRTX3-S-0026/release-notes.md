---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0026
idea: VRTX3-I-0035
branch: vortex/sprint/vrtx3-s-0026-52dbe58c
upstream: [artifacts/VRTX3-S-0026/qa-test-report.md]
---

# Release notes — VRTX3-S-0026

## Added

- `GET /api/healthz-smoke-888240601-a` now answers with `{"ok":true,"variant":"888240601"}` and
  `Content-Type: application/json`. Previously the path fell through to the SPA HTML shell, so a
  smoke probe got no health signal from it. (VRTX3-T-0181)
- `GET /api/healthz-smoke-888240601-b` — same response, same behaviour. (VRTX3-T-0182)
- `GET /api/healthz-smoke-888240601-c` — same response, same behaviour. (VRTX3-T-0183)

All three answer without auth and without the database, so they stay usable when either is
unavailable. The probe family is now 89 endpoints.

## Upgrade notes

None. The release is purely additive — three new endpoints, no existing route, page, schema,
migration, config file or dependency changed. Nothing to migrate, no flag to set, no breaking change.

One behaviour to be aware of when writing a probe against these paths, unchanged from the rest of the
family: the handlers are method-agnostic, so `POST`, `PUT` and `DELETE` return the same `200` JSON
body as `GET`. Also note that an `/api/*` path with no handler answers `200 text/html` (the SPA
shell) rather than `404` — check the response body and `Content-Type`, not the status code, when
verifying any of these endpoints.

## Not included

Deliberately out of scope per VRTX3-I-0035, and not delivered:

- Method guards — no `405` for non-`GET` verbs on these endpoints.
- Any shared helper, factory or barrel export across the three probes, and any refactor of the
  existing 86. The duplication is the design; it is what lets each probe be built and merged
  independently.
- Auth, rate limiting, caching, logging or metrics on these endpoints.
- Playwright/E2E specs targeting the new probes; colocated unit tests plus a live body and
  `Content-Type` check are the verification bar for a probe.
- Any change to the SPA-fallback behaviour for unmatched `/api/*` paths.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0026/qa-test-report.md` (PASS, 0 defects).

## Compliance / Control Evidence

| Control / policy             | Evidence produced                      | Location                                   | Status    | Exception |
| ---------------------------- | -------------------------------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file                              | `artifacts/VRTX3-S-0026/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict                        | `artifacts/VRTX3-S-0026/qa-test-report.md` | Satisfied | —         |
| Known limitations disclosed  | method-agnostic handlers, SPA fallback | `## Upgrade notes` above                   | Satisfied | —         |
| Release traceable to tickets | ticket key on every entry              | VRTX3-T-0181, VRTX3-T-0182, VRTX3-T-0183   | Satisfied | —         |
