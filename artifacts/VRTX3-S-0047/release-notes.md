---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: VRTX3-S-0047
idea: VRTX3-I-0057
branch: vortex/sprint/vrtx3-s-0047-8cd3c597
upstream: [artifacts/VRTX3-S-0047/qa-test-report.md]
---

# Release notes — VRTX3-S-0047

## Added

Three new health probe endpoints, each answering with a fixed JSON body:

- `GET /api/healthz-smoke-436511294-a` returns `200` with
  `{"ok":true,"variant":"436511294"}` as `application/json`. (VRTX3-T-0316)
- `GET /api/healthz-smoke-436511294-b` returns `200` with the same body. (VRTX3-T-0317)
- `GET /api/healthz-smoke-436511294-c` returns `200` with the same body. (VRTX3-T-0318)

All three share the `436511294` variant string; the trailing `-a` / `-b` / `-c` distinguishes the
paths. That matches how existing sibling probes behave.

Each is usable as a liveness check: it needs no authentication and does not touch the database, so
it still answers when either is unavailable. Each returns byte-identical JSON on repeat calls
regardless of query string, headers or request body — verified at QA under `GET`, `POST`, an added
`Authorization` header and an added query string.

## Changed

Nothing. No endpoint, schema, configuration, default or dependency that already existed was
modified. The release adds 1116 lines and deletes none, across six new source files and their
sprint artifacts.

## Upgrade notes

None required. The release is purely additive and there is no migration to run.

Two operational notes for anyone monitoring these paths:

- **Check the response body, not the status code.** An `/api/*` path this server does not recognise
  returns `200 text/html` — the single-page-app shell — rather than `404`. A status-code-only
  monitor therefore reports success against a URL that does not exist. Assert on the body or
  `Content-Type`.
- **The server requires the Bun runtime**, unchanged from previous releases.

## Not included

- No shared helper, factory, constants file or barrel export behind the probe family. Each probe
  remains self-contained by design, so deleting any one leaves the other two working.
- No authentication, database access or non-`GET` method handling. Any HTTP verb returns the same
  body, consistent with the rest of the family — confirmed live at QA, and not a defect.
- No frontend surface and no Playwright coverage of the new paths.
- No wall-clock timing assertion in the new tests. The property such a check targets — the handler
  performs no I/O — is guaranteed by the import surface (`nitro/h3` only, no database, no
  request-context read), whereas a wall-clock number on a shared CI runner is flaky and proves
  nothing about the contract.
- No root document changed, and no changelog entry was added to one. The capability these probes
  belong to was already documented and described without enumeration, so nothing became inaccurate;
  `grep` for the new variant across all four root docs returns nothing.
- No monitoring or uptime-service registration. The paths exist; wiring a monitor to them is not
  part of this release.

## Verification

Verified at integration QA — see `artifacts/VRTX3-S-0047/qa-test-report.md` (PASS: all three
endpoints confirmed live against a running server, not only via unit tests; all 15 delta-spec
scenarios pass with an enumerated verdict line each; production route output confirmed under
`.output/server/_routes/api/` with no test file present; E2E suite 6/6 green with no regression).

Re-confirmed at close on the integrated sprint branch: `bun run verify` exit `0` — **155 test files,
215 tests passing**, lint clean at `--max-warnings 0`, typecheck clean.
`git diff --name-status 351a214..HEAD` returns no entry that is not an addition.

## Compliance / Control Evidence

| Control / policy                 | Evidence produced                              | Location                                                     | Status    | Exception                                                                |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------------------ |
| Release contents recorded        | this file                                      | `artifacts/VRTX3-S-0047/release-notes.md`                    | Satisfied | —                                                                        |
| Release verified before land     | QA PASS verdict + close re-verification        | `artifacts/VRTX3-S-0047/qa-test-report.md`                   | Satisfied | —                                                                        |
| Behaviour specified before build | 3 requirements, 15 scenarios, strict-validated | `openspec/changes/vrtx3-i-0057-smoke-178782657090712-3-ind/` | Satisfied | Merges into the spec of record at close, per the platform's archive step |
| Per-ticket plan authored upfront | 3 PLAN.md, 3 summaries, 3 TDD results          | `VRTX3-T-0316/`, `VRTX3-T-0317/`, `VRTX3-T-0318/`            | Satisfied | Six per-ticket artifacts carry truncated identity frontmatter — see R6   |
| Known limitations communicated   | scope exclusions + status-code caveat, above   | this file § Not included, § Upgrade notes                    | Satisfied | —                                                                        |
| Open defects at release          | 0 found, 0 open                                | `artifacts/VRTX3-S-0047/integration-defects-resolution.md`   | Satisfied | —                                                                        |

Two contract gaps predating this release remain outstanding and are unaffected by it: six
requirements from VRTX3-S-0044 and VRTX3-S-0045 are written and validated but not yet in the merged
spec of record. See `artifacts/VRTX3-S-0047/sprint-summary.md` § Retrospective R1 and § Follow-ups
F1 — that entry also records what this close _disproved_ about the cause.
