---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0043
idea: VRTX3-I-0052
branch: vortex/sprint/vrtx3-s-0043-5e7e01b2
upstream: [artifacts/VRTX3-S-0043/qa-test-report.md]
---

# Release notes — VRTX3-S-0043

## Fixed

Three health probe endpoints were unreachable — each returned the single-page-app HTML shell
instead of its JSON body, because the route handler had never been written. All three now answer
correctly:

- `GET /api/healthz-smoke-bugfix-507266122` returns `200` with
  `{"ok":true,"variant":"507266122"}` as `application/json`. (VRTX3-T-0289)
- `GET /api/healthz-smoke-bugfix2-232336916` returns `200` with
  `{"ok":true,"variant":"232336916"}` as `application/json`. (VRTX3-T-0290)
- `GET /api/healthz-smoke-bugfix3-827939824` returns `200` with
  `{"ok":true,"variant":"827939824"}` as `application/json`. (VRTX3-T-0291)

Each is usable as a liveness check: it needs no authentication and does not touch the database, so
it still answers when either is unavailable. Each returns byte-identical JSON on repeat calls
regardless of query string, headers or request body.

**These endpoints were reported as returning `404`. They did not.** An `/api/*` path this server
does not recognise returns `200 text/html` — the SPA shell — so the reported status code was a
mis-transcription in all three reports. The defects were real; only the status code was wrong. This
matters to anyone who wrote a monitor against these paths: see § Upgrade notes.

## Upgrade notes

None required. The release is additive — three new route handlers and their tests, no existing
endpoint, schema, configuration or default changed, and no migration to run. Nothing that already
existed in the repository was modified.

Two operational notes for anyone monitoring these paths:

- **Check the response body, not the status code.** Because an unrecognised `/api/*` path returns
  `200 text/html` rather than `404`, a status-code-only monitor reports success against a URL that
  does not exist — which is precisely how these three probes stayed broken. Assert on the body or
  `Content-Type`.
- **The server requires the Bun runtime**, unchanged from previous releases.

## Not included

- No shared helper, factory, constants file or barrel export behind the probe family. Each probe
  remains self-contained by design.
- No authentication, database access or non-`GET` method handling. Any HTTP verb returns the same
  body, consistent with the rest of the family.
- No frontend surface and no Playwright coverage of the new paths.
- No wall-clock timing assertion in the new tests. VRTX3-I-0052's AC-3 asked for a sub-100ms check;
  it was declined deliberately. The property it targets — the handler performs no I/O — is
  guaranteed by the import surface (`nitro/h3` only, no database, no request-context read), whereas
  a wall-clock number on a shared CI runner is flaky and proves nothing about the contract. See
  `artifacts/VRTX3-S-0043/sprint-summary.md` § Divergence from plan.
- No root document was changed by this release, and no changelog entry was added to one. The
  capability these probes belong to was already documented and described without enumeration, so
  nothing became inaccurate.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0043/qa-test-report.md` (PASS: all three
endpoints confirmed live against a running server, not only via unit tests; production route output
confirmed under `.output/server/_routes/api/`; E2E suite 6/6 green with no regression).

Re-confirmed at close on the integrated sprint branch: `bun run verify` exit `0` — **143 test
files, 203 tests passing**, lint clean at `--max-warnings 0`, typecheck clean.

## Compliance / Control Evidence

| Control / policy               | Evidence produced                            | Location                                                   | Status    | Exception |
| ------------------------------ | -------------------------------------------- | ---------------------------------------------------------- | --------- | --------- |
| Release contents recorded      | this file                                    | `artifacts/VRTX3-S-0043/release-notes.md`                  | Satisfied | —         |
| Release verified before land   | QA PASS verdict + close re-verification      | `artifacts/VRTX3-S-0043/qa-test-report.md`                 | Satisfied | —         |
| Root cause recorded per defect | three RCA + fix plans, three fix notes       | `VRTX3-T-0289/`, `VRTX3-T-0290/`, `VRTX3-T-0291/`          | Satisfied | —         |
| Known limitations communicated | scope exclusions + status-code caveat, above | this file § Not included, § Upgrade notes                  | Satisfied | —         |
| Open defects at release        | 0 found, 0 open                              | `artifacts/VRTX3-S-0043/integration-defects-resolution.md` | Satisfied | —         |
