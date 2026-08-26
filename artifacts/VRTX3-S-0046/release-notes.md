---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0046
idea: VRTX3-I-0055
branch: vortex/sprint/vrtx3-s-0046-9f6553fc
upstream: [artifacts/VRTX3-S-0046/qa-test-report.md]
---

# Release notes — VRTX3-S-0046

## Fixed

Three health probe endpoints were unreachable — each returned the single-page-app HTML shell instead
of its JSON body, because the route handler had never been written. All three now answer correctly:

- `GET /api/healthz-smoke-bugfix-769466328` returns `200` with
  `{"ok":true,"variant":"769466328"}` as `application/json`. (VRTX3-T-0307)
- `GET /api/healthz-smoke-bugfix2-101945976` returns `200` with
  `{"ok":true,"variant":"101945976"}` as `application/json`. (VRTX3-T-0308)
- `GET /api/healthz-smoke-bugfix3-238143877` returns `200` with
  `{"ok":true,"variant":"238143877"}` as `application/json`. (VRTX3-T-0309)

Each is usable as a liveness check: it needs no authentication and does not touch the database, so it
still answers when either is unavailable. Each returns byte-identical JSON on repeat calls regardless
of query string, headers or request body.

**These endpoints were reported as returning `404`. They did not.** An `/api/*` path this server does
not recognise returns `200 text/html` — the SPA shell — so the reported status code was a
mis-transcription in all three reports. The defects were real; only the status code was wrong. This
matters to anyone who wrote a monitor against these paths: see § Upgrade notes.

## Changed

Nothing user-visible beyond the three endpoints above. Nothing that already existed in the repository
was modified — the release adds 1176 lines and deletes none.

## Upgrade notes

None required. The release is additive — three new route handlers and their tests, no existing
endpoint, schema, configuration or default changed, and no migration to run.

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
  body, consistent with the rest of the family — confirmed live at QA.
- No frontend surface and no Playwright coverage of the new paths.
- No wall-clock timing assertion in the new tests. The property such a check targets — the handler
  performs no I/O — is guaranteed by the import surface (`nitro/h3` only, no database, no
  request-context read), whereas a wall-clock number on a shared CI runner is flaky and proves
  nothing about the contract.
- **These three endpoints are specified in this sprint's change, but are not in the merged spec of
  record.** `openspec/specs/health-probes/` currently carries 15 requirements and none of the
  `healthz-smoke-bugfix*` subfamily — including the six shipped by the previous two releases, both of
  which have landed on `dev`. The behaviour described above is delivered and verified regardless;
  what is outstanding is the merge of the written contract, now three sprints deep. Carried out of
  the sprint as a follow-up, not a defect — see `artifacts/VRTX3-S-0046/sprint-summary.md`
  § Retrospective R5 and § Follow-ups F1.
- Only 9 of the 74 numbered `healthz-smoke-bugfix*` variants have been specified at all, across three
  sprints. The other 65 remain undocumented.
- No root document was changed by this release, and no changelog entry was added to one. The
  capability these probes belong to was already documented and described without enumeration, so
  nothing became inaccurate.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0046/qa-test-report.md` (PASS: all three
endpoints confirmed live against a running server, not only via unit tests; all 18 delta-spec
scenarios pass with an enumerated verdict line each; production route output confirmed under
`.output/server/_routes/api/`; E2E suite 6/6 green with no regression).

Re-confirmed at close on the integrated sprint branch: `bun run verify` exit `0` — **152 test files,
212 tests passing**, lint clean at `--max-warnings 0`, typecheck clean.
`git diff --name-status 2b8bb3e..HEAD` returns no entry that is not an addition.

## Compliance / Control Evidence

| Control / policy               | Evidence produced                              | Location                                                     | Status    | Exception                                                                  |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ | --------- | -------------------------------------------------------------------------- |
| Release contents recorded      | this file                                      | `artifacts/VRTX3-S-0046/release-notes.md`                    | Satisfied | —                                                                          |
| Release verified before land   | QA PASS verdict + close re-verification        | `artifacts/VRTX3-S-0046/qa-test-report.md`                   | Satisfied | —                                                                          |
| Behaviour specified before fix | 3 requirements, 18 scenarios, strict-validated | `openspec/changes/vrtx3-s-0046-smoke-bugfix-sprint-smoke-b/` | Satisfied | Not yet merged into the spec of record — see F1                            |
| Root cause recorded per defect | three RCA + fix plans, three fix notes         | `VRTX3-T-0307/`, `VRTX3-T-0308/`, `VRTX3-T-0309/`            | Satisfied | Two fix notes carry non-standard frontmatter, one TDD result none — see R6 |
| Known limitations communicated | scope exclusions + status-code caveat, above   | this file § Not included, § Upgrade notes                    | Satisfied | —                                                                          |
| Open defects at release        | 0 found, 0 open                                | `artifacts/VRTX3-S-0046/integration-defects-resolution.md`   | Satisfied | —                                                                          |
