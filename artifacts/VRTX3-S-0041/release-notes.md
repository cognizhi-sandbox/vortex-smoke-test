---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0041
idea: VRTX3-I-0050
branch: vortex/sprint/vrtx3-s-0041-9e5df666
upstream: [artifacts/VRTX3-S-0041/qa-test-report.md]
---

# Release notes — VRTX3-S-0041

## Added

- `GET /api/healthz-smoke-865643533-a` answers `200` with `{"ok":true,"variant":"865643533"}` as
  `application/json`. Usable as a liveness check — it needs no authentication and does not touch the
  database, so it still answers when either is unavailable. (VRTX3-T-0276)
- `GET /api/healthz-smoke-865643533-b` — same response and same guarantees. (VRTX3-T-0277)
- `GET /api/healthz-smoke-865643533-c` — same response and same guarantees. (VRTX3-T-0278)

Each path returns byte-identical JSON on repeat calls regardless of query string, headers or request
body.

## Upgrade notes

None. The release is additive — three new paths, no existing endpoint, schema, configuration or
default changed, and no migration to run. Nothing that already existed in the repository was
modified by this sprint.

Two operational notes for anyone monitoring these paths:

- **Check the response body, not the status code.** An `/api/*` path this server does not recognise
  returns `200 text/html` (the single-page-app shell), so a status-code-only probe reports success
  against a URL that does not exist. Assert on the body or `Content-Type`.
- **The server requires the Bun runtime**, unchanged from previous releases.

## Not included

Everything VRTX3-I-0050 placed out of scope is genuinely absent, by design rather than by omission:
no shared helper or parameterised route behind the three probes, no authentication or database
access, no non-`GET` method handling (any verb returns the same body, consistent with the rest of
the probe family), no frontend surface, and no Playwright coverage of the new paths.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0041/qa-test-report.md` (PASS: 15/15 spec
scenarios, live response confirmed per path, production route output confirmed, existing E2E suite
green with no regression). Re-confirmed at close on the integrated sprint branch: `bun run verify`
exit `0`, 137 test files, 197 tests passing.

## Compliance / Control Evidence

| Control / policy               | Evidence produced                            | Location                                                   | Status    | Exception |
| ------------------------------ | -------------------------------------------- | ---------------------------------------------------------- | --------- | --------- |
| Release contents recorded      | this file                                    | `artifacts/VRTX3-S-0041/release-notes.md`                  | Satisfied | —         |
| Release verified before land   | QA PASS verdict                              | `artifacts/VRTX3-S-0041/qa-test-report.md`                 | Satisfied | —         |
| Known limitations communicated | scope exclusions + probe-check caveat, above | this file § Not included, § Upgrade notes                  | Satisfied | —         |
| Open defects at release        | 0 found, 0 open                              | `artifacts/VRTX3-S-0041/integration-defects-resolution.md` | Satisfied | —         |
