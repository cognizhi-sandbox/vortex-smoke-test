---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0044
idea: VRTX3-I-0053
branch: vortex/sprint/vrtx3-s-0044-7d6d10f2
upstream: [artifacts/VRTX3-S-0044/qa-test-report.md]
---

# Release notes — VRTX3-S-0044

## Fixed

Three health probe endpoints were unreachable — each returned the single-page-app HTML shell
instead of its JSON body, because the route handler had never been written. All three now answer
correctly:

- `GET /api/healthz-smoke-bugfix-588991239` returns `200` with
  `{"ok":true,"variant":"588991239"}` as `application/json`. (VRTX3-T-0295)
- `GET /api/healthz-smoke-bugfix2-369920394` returns `200` with
  `{"ok":true,"variant":"369920394"}` as `application/json`. (VRTX3-T-0296)
- `GET /api/healthz-smoke-bugfix3-1056287485` returns `200` with
  `{"ok":true,"variant":"1056287485"}` as `application/json`. (VRTX3-T-0297)

Each is usable as a liveness check: it needs no authentication and does not touch the database, so
it still answers when either is unavailable. Each returns byte-identical JSON on repeat calls
regardless of query string, headers or request body.

**These endpoints were reported as returning `404`. They did not.** An `/api/*` path this server
does not recognise returns `200 text/html` — the SPA shell — so the reported status code was a
mis-transcription in all three reports. The defects were real; only the status code was wrong. This
matters to anyone who wrote a monitor against these paths: see § Upgrade notes.

## Changed

Nothing user-visible beyond the three endpoints above. One change to the written contract is worth
naming for operators:

**The three probes are now specified, not merely shipped.** This release is the first to write any
`/api/healthz-smoke-bugfix*` endpoint into the spec of record — the whole subfamily was previously
undocumented there. Each of the three now carries a named requirement and six scenarios, one of
which states that an unrouted `/api/*` path is distinguishable from a working one **only by body
and content type, never by status code**. That behaviour is not new; writing it down is.

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
- No wall-clock timing assertion in the new tests. The property such a check targets — the handler
  performs no I/O — is guaranteed by the import surface (`nitro/h3` only, no database, no
  request-context read), whereas a wall-clock number on a shared CI runner is flaky and proves
  nothing about the contract.
- **Only 3 of the 63 numbered `healthz-smoke-bugfix*` variants are specified by this release.** The
  other 60 remain absent from the spec of record. Carried out of the sprint as a follow-up, not a
  defect — see `artifacts/VRTX3-S-0044/sprint-summary.md` § Follow-ups.
- No root document was changed by this release, and no changelog entry was added to one. The
  capability these probes belong to was already documented and described without enumeration, so
  nothing became inaccurate.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0044/qa-test-report.md` (PASS: all three
endpoints confirmed live against a running server, not only via unit tests; all 18 delta-spec
scenarios pass; production route output confirmed under `.output/server/_routes/api/`; E2E suite
6/6 green with no regression).

Re-confirmed at close on the integrated sprint branch: `bun run verify` exit `0` — **146 test
files, 206 tests passing**, lint clean at `--max-warnings 0`, typecheck clean.

One correction to the QA report, which does not affect its verdict: its executive summary counts
"15 delta-spec scenarios (5 per requirement × 3)". The delta carries 18 (6 per requirement × 3),
and the report enumerates 18 `SCENARIO-VERDICT:` lines, all pass. Coverage is complete; the count
in the prose is not.

## Compliance / Control Evidence

| Control / policy               | Evidence produced                              | Location                                                     | Status    | Exception |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ | --------- | --------- |
| Release contents recorded      | this file                                      | `artifacts/VRTX3-S-0044/release-notes.md`                    | Satisfied | —         |
| Release verified before land   | QA PASS verdict + close re-verification        | `artifacts/VRTX3-S-0044/qa-test-report.md`                   | Satisfied | —         |
| Behaviour specified before fix | 3 requirements, 18 scenarios, strict-validated | `openspec/changes/vrtx3-s-0044-smoke-bugfix-sprint-smoke-b/` | Satisfied | —         |
| Root cause recorded per defect | three RCA + fix plans, three fix notes         | `VRTX3-T-0295/`, `VRTX3-T-0296/`, `VRTX3-T-0297/`            | Satisfied | —         |
| Known limitations communicated | scope exclusions + status-code caveat, above   | this file § Not included, § Upgrade notes                    | Satisfied | —         |
| Open defects at release        | 0 found, 0 open                                | `artifacts/VRTX3-S-0044/integration-defects-resolution.md`   | Satisfied | —         |
