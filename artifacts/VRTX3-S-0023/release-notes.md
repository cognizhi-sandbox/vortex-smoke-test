---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0023
idea: VRTX3-I-0032
branch: vortex/sprint/vrtx3-s-0023-c5a223f8
upstream: [artifacts/VRTX3-S-0023/qa-test-report.md]
---

# Release notes — VRTX3-S-0023

Audience note: these endpoints are operational probes. No end-user-facing surface changed this
release — nothing in the UI, no page, no navigation entry.

## Added

- Operators can now check that the deployed build is serving the Nitro API through three new
  independent health probes, each answering `200 application/json` with body
  `{"ok":true,"variant":"1065915107"}`:
  - `GET /api/healthz-smoke-1065915107-a` (VRTX3-T-0162)
  - `GET /api/healthz-smoke-1065915107-b` (VRTX3-T-0163)
  - `GET /api/healthz-smoke-1065915107-c` (VRTX3-T-0164)

  Each is independent of the other two and of the rest of the application — no auth, no database, no
  shared code — so each stays answerable when auth or the database is unavailable. The probe family
  now numbers 83.

## Upgrade notes

None. The change is purely additive: three new URLs, no existing endpoint altered, no migration, no
configuration change, no feature flag, no new dependency, and no change to routing, the test harness
or CI.

**When checking these paths, read the response body — not the status code.** An `/api/*` path with
no handler is answered by the SPA `index.html` shell with `200 text/html`, so a status-code check
succeeds whether or not the route exists. A working probe returns
`Content-Type: application/json;charset=UTF-8`; the SPA shell returns `text/html; charset=utf-8`.

## Not included

Nothing planned for this sprint was dropped — the full scope of VRTX3-I-0032 shipped. Explicitly out
of scope by the idea's own non-scope section, and therefore not present: method guards (every HTTP
verb returns the same 200 body, as with all 83 probes), any shared helper or factory across probes,
auth or database access on a probe, Playwright coverage of the new routes, and retirement of older
probes.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0023/qa-test-report.md` (PASS, no defects found).

## Compliance / Control Evidence

| Control                        | Evidence                                                 | Location                                         | Status    | Exception |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------ | --------- | --------- |
| Release contents recorded      | this file                                                | `artifacts/VRTX3-S-0023/release-notes.md`        | Satisfied | —         |
| Release verified before land   | QA PASS verdict, executed evidence                       | `artifacts/VRTX3-S-0023/qa-test-report.md`       | Satisfied | —         |
| Known limitations communicated | SPA-fallback caveat under Upgrade notes; no open defects | this file; `…/integration-defects-resolution.md` | Satisfied | —         |
| Change traceable to ticket     | Every entry carries its ticket key                       | this file § Added                                | Satisfied | —         |
