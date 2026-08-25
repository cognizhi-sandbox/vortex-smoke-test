---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0039
idea: VRTX3-I-0048
change: vrtx3-i-0048-smoke-178762111363042-3-independent-endpoints-81
branch: vortex/sprint/vrtx3-s-0039-4e9a09bd
upstream: [artifacts/VRTX3-S-0039/sprint-summary.md]
---

# Release notes — VRTX3-S-0039

**Released:** 2026-08-25 · **Type:** Enhancement (additive) · **Breaking changes:** none

## Added

Three health probe endpoints, each returning HTTP 200 with
`Content-Type: application/json` and the body `{"ok":true,"variant":"812788042"}`:

- `GET /api/healthz-smoke-812788042-a`
- `GET /api/healthz-smoke-812788042-b`
- `GET /api/healthz-smoke-812788042-c`

Each answers without an `Authorization` header and without a database available — the handler
reads no request context and issues no query — so a 200 confirms the Nitro server process itself
is up. Each is independent of the other two: separate file, no shared helper, no cross-import.

The response is fixed. Query string, headers, request body and HTTP method do not change it;
repeat calls return byte-identical JSON. Like the other 121 probes, these carry no method suffix
and answer every verb with the same body.

## Changed

Nothing. No existing endpoint, page, schema, migration, dependency or configuration was modified.
Six files were added and zero were changed.

## Fixed

Nothing — this is an additive sprint with no defect in scope, and integration QA found none.

## Upgrade notes

None required. The endpoints are picked up by Nitro's file-based routing with no registration
step, and nothing in the repository consumes a probe response.

Operators adding a health check against these paths: **assert on the response body and
`Content-Type`, not the status code.** An unmatched `/api/*` path in this application falls
through to the SPA shell and answers `200 text/html`, so a status-code-only check passes whether
or not the endpoint exists.

## Verification

- `bun run verify` — exit 0, 131 test files, 191 tests passed
- Full Playwright E2E suite — 6 passed, 0 failed, 0 skipped
- `bun run build` — all three route modules present in the production server output, no test files
  bundled
- All three endpoints verified live against a built server: correct status, content type and exact
  body
- 15 of 15 delta-spec scenarios pass; zero defects found

## Known issues

None.
